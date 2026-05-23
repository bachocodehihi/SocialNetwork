import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:socialnetwork/data/service/socket.dart';

enum CallState { idle, ringing, calling, connected, ended }

class CallInfo {
  final String callId;
  final String conversationId;
  final String callType; // 'voice' | 'video' | 'audio'
  final Map<String, dynamic> remoteUser; // { _id, username, avatar }
  final bool isIncoming;
  final bool isGroup;

  CallInfo({
    required this.callId,
    required this.conversationId,
    required this.callType,
    required this.remoteUser,
    required this.isIncoming,
    this.isGroup = false,
  });

  CallInfo copyWith({
    String? callId,
    String? conversationId,
    String? callType,
    Map<String, dynamic>? remoteUser,
    bool? isIncoming,
    bool? isGroup,
  }) {
    return CallInfo(
      callId: callId ?? this.callId,
      conversationId: conversationId ?? this.conversationId,
      callType: callType ?? this.callType,
      remoteUser: remoteUser ?? this.remoteUser,
      isIncoming: isIncoming ?? this.isIncoming,
      isGroup: isGroup ?? this.isGroup,
    );
  }
}

class CallService extends ChangeNotifier {
  static final CallService _instance = CallService._internal();
  factory CallService() => _instance;
  CallService._internal();

  final _socket = SocketService();

  CallState _callState = CallState.idle;
  CallInfo? _currentCall;
  bool _isMuted = false;
  bool _isSpeakerOn = false;
  Duration _callDuration = Duration.zero;
  Timer? _durationTimer;
  Timer? _autoCancelTimer;

  Map<String, dynamic>? _pendingOffer;

  // 1-on-1 WebRTC
  RTCPeerConnection? _pc;
  MediaStream? _localStream;
  MediaStream? _remoteStream;

  // Group WebRTC mesh: map of peerId -> PeerConnection
  final Map<String, RTCPeerConnection> _groupPcs = {};
  // Track of other active user details in the group call
  final Map<String, Map<String, dynamic>> _groupParticipants = {};

  // UI callbacks to invoke
  void Function(CallInfo)? onIncomingCall;
  void Function()? onCallEnded;
  void Function()? onCallConnected;
  void Function(String message)? onCallError;

  CallState get callState => _callState;
  CallInfo? get currentCall => _currentCall;
  bool get isMuted => _isMuted;
  bool get isSpeakerOn => _isSpeakerOn;
  Duration get callDuration => _callDuration;
  bool get isInCall => _callState != CallState.idle && _callState != CallState.ended;
  Map<String, Map<String, dynamic>> get groupParticipants => _groupParticipants;

  Future<void> init() async {
    _registerListeners();
    debugPrint('✅ CallService initialized');
  }

  void _registerListeners() {
    _socket.on('call_incoming', _onCallIncoming);
    _socket.on('call_accepted', _onCallAccepted);
    _socket.on('call_rejected', _onCallRejected);
    _socket.on('call_cancelled', _onCallCancelled);
    _socket.on('call_ended', _onCallEnded);
    _socket.on('call_busy', _onCallBusy);
    _socket.on('call_error', _onCallError);
    _socket.on('signal', _onSignal);

    // Group calling listeners
    _socket.on('group_call_incoming', _onGroupCallIncoming);
    _socket.on('group_call_user_joined', _onGroupCallUserJoined);
    _socket.on('group_call_user_left', _onGroupCallUserLeft);
    _socket.on('group_signal', _onGroupSignal);
  }

  // ─────────────── 1-ON-1 VOICE CALLS ───────────────
  Future<void> startCall({
    required String receiverId,
    required String conversationId,
    required Map<String, dynamic> receiverInfo,
  }) async {
    if (_callState != CallState.idle) return;

    try {
      _currentCall = CallInfo(
        callId: '',
        conversationId: conversationId,
        callType: 'voice',
        remoteUser: receiverInfo,
        isIncoming: false,
        isGroup: false,
      );
      _callState = CallState.ringing;
      notifyListeners();

      // Initialize peer connection and local audio stream
      await _setupPeerConnection(receiverId);

      // Create and set local SDP offer
      final offer = await _pc!.createOffer();
      await _pc!.setLocalDescription(offer);

      _socket.emit('call_initiate', {
        'receiverId': receiverId,
        'conversationId': conversationId,
        'callType': 'voice',
        'offer': {'type': offer.type, 'sdp': offer.sdp},
      });

      _autoCancelTimer?.cancel();
      _autoCancelTimer = Timer(const Duration(seconds: 45), () {
        if (_callState == CallState.ringing) {
          cancelCall();
        }
      });
    } catch (e) {
      debugPrint('❌ startCall error: $e');
      _resetCall();
    }
  }

  void _onCallIncoming(dynamic data) {
    if (_callState != CallState.idle) {
      _socket.emit('call_reject', {'callId': data['callId'].toString()});
      return;
    }

    if (data['offer'] != null) {
      _pendingOffer = Map<String, dynamic>.from(data['offer']);
    }

    final callerRaw = data['caller'];
    final remoteUser = callerRaw is Map
        ? Map<String, dynamic>.from(callerRaw)
        : {'_id': callerRaw.toString(), 'username': 'Unknown', 'avatar': ''};

    _currentCall = CallInfo(
      callId: data['callId'].toString(),
      conversationId: data['conversationId']?.toString() ?? '',
      callType: data['callType'] ?? 'voice',
      remoteUser: remoteUser,
      isIncoming: true,
      isGroup: false,
    );
    _callState = CallState.ringing;
    notifyListeners();

    onIncomingCall?.call(_currentCall!);
  }

  Future<void> acceptCall() async {
    if (_currentCall == null || _callState != CallState.ringing) return;

    _callState = CallState.calling;
    notifyListeners();

    try {
      await _setupPeerConnection(_currentCall!.remoteUser['_id']);

      if (_pendingOffer != null) {
        await _pc!.setRemoteDescription(
          RTCSessionDescription(_pendingOffer!['sdp'], _pendingOffer!['type']),
        );
        _pendingOffer = null;
      }

      final answer = await _pc!.createAnswer();
      await _pc!.setLocalDescription(answer);

      _socket.emit('call_accept', {
        'callId': _currentCall!.callId,
        'answer': {'type': answer.type, 'sdp': answer.sdp},
      });
    } catch (e) {
      debugPrint('❌ acceptCall error: $e');
      _resetCall();
    }
  }

  Future<void> rejectCall() async {
    if (_currentCall == null) return;
    _pendingOffer = null;
    _socket.emit('call_reject', {'callId': _currentCall!.callId});
    _resetCall();
    onCallEnded?.call();
  }

  Future<void> cancelCall() async {
    if (_currentCall == null) return;
    _autoCancelTimer?.cancel();
    _socket.emit('call_cancel', {'callId': _currentCall!.callId});
    _resetCall();
    onCallEnded?.call();
  }

  Future<void> endCall() async {
    if (_currentCall == null) return;
    if (_currentCall!.isGroup) {
      _socket.emit('group_call_leave', {'conversationId': _currentCall!.conversationId});
    } else {
      _socket.emit('call_end', {
        'callId': _currentCall!.callId,
        'endedBy': _socket.currentUserId,
      });
    }
    _resetCall();
    onCallEnded?.call();
  }

  void _onCallAccepted(dynamic data) {
    _autoCancelTimer?.cancel();
    if (_currentCall != null) {
      _currentCall = _currentCall!.copyWith(callId: data['callId'].toString());
    }
    _callState = CallState.calling;
    notifyListeners();

    if (data['answer'] != null) {
      _pc?.setRemoteDescription(RTCSessionDescription(
        data['answer']['sdp'],
        data['answer']['type'],
      ));
    }
  }

  void _onCallRejected(dynamic data) {
    _resetCall();
    onCallEnded?.call();
  }

  void _onCallCancelled(dynamic data) {
    _resetCall();
    onCallEnded?.call();
  }

  void _onCallEnded(dynamic data) {
    _resetCall();
    onCallEnded?.call();
  }

  void _onCallBusy(dynamic data) {
    _resetCall();
    onCallEnded?.call();
  }

  void _onCallError(dynamic data) {
    _resetCall();
    onCallEnded?.call();
  }

  Future<void> _onSignal(dynamic data) async {
    final signal = data['signal'];
    if (signal == null || _pc == null) return;

    if (signal['type'] == 'candidate') {
      try {
        await _pc!.addCandidate(RTCIceCandidate(
          signal['candidate'],
          signal['sdpMid'],
          signal['sdpMLineIndex'],
        ));
      } catch (_) {}
    }
  }

  // ─────────────── GROUP VOICE CALLS ───────────────
  Future<void> startGroupCall({
    required String conversationId,
    required String groupName,
    String? groupAvatar,
  }) async {
    if (_callState != CallState.idle) return;

    try {
      _currentCall = CallInfo(
        callId: '',
        conversationId: conversationId,
        callType: 'voice',
        remoteUser: {
          '_id': conversationId,
          'username': groupName,
          'avatar': groupAvatar ?? '',
        },
        isIncoming: false,
        isGroup: true,
      );
      _callState = CallState.calling;
      notifyListeners();

      _socket.emit('group_call_initiate', {
        'conversationId': conversationId,
        'callType': 'voice',
      });

      _socket.emit('group_call_join', {
        'conversationId': conversationId,
      });

      _localStream?.dispose();
      _localStream = await navigator.mediaDevices.getUserMedia({'audio': true, 'video': false});
      _startDurationTimer();
      _callState = CallState.connected;
      notifyListeners();
    } catch (e) {
      debugPrint('❌ startGroupCall error: $e');
      _resetCall();
    }
  }

  void _onGroupCallIncoming(dynamic data) {
    if (_callState != CallState.idle) return;

    final callerRaw = data['caller'];
    final remoteUser = callerRaw is Map
        ? Map<String, dynamic>.from(callerRaw)
        : {'_id': callerRaw.toString(), 'username': 'Unknown', 'avatar': ''};

    _currentCall = CallInfo(
      callId: data['callId'].toString(),
      conversationId: data['conversationId'].toString(),
      callType: 'voice',
      remoteUser: remoteUser,
      isIncoming: true,
      isGroup: true,
    );
    _callState = CallState.ringing;
    notifyListeners();

    onIncomingCall?.call(_currentCall!);
  }

  Future<void> acceptGroupCall() async {
    if (_currentCall == null || _callState != CallState.ringing) return;

    _callState = CallState.calling;
    notifyListeners();

    try {
      _localStream?.dispose();
      _localStream = await navigator.mediaDevices.getUserMedia({'audio': true, 'video': false});

      _socket.emit('group_call_join', {
        'conversationId': _currentCall!.conversationId,
      });

      _startDurationTimer();
      _callState = CallState.connected;
      notifyListeners();
    } catch (e) {
      debugPrint('❌ acceptGroupCall error: $e');
      _resetCall();
    }
  }

  Future<void> _onGroupCallUserJoined(dynamic data) async {
    final joinedUserId = data['userId']?.toString();
    if (joinedUserId == null || joinedUserId == _socket.currentUserId) return;

    debugPrint('👥 Peer joined group call: $joinedUserId');

    try {
      final pc = await _createGroupPeerConnection(joinedUserId);
      _groupPcs[joinedUserId] = pc;

      final offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      _socket.emit('group_signal', {
        'targetUserId': joinedUserId,
        'conversationId': _currentCall!.conversationId,
        'signal': {'type': offer.type, 'sdp': offer.sdp},
      });
    } catch (e) {
      debugPrint('Error initiating peer connection to $joinedUserId: $e');
    }
  }

  void _onGroupCallUserLeft(dynamic data) {
    final leftUserId = data['userId']?.toString();
    if (leftUserId == null) return;

    debugPrint('👥 Peer left group call: $leftUserId');
    _groupPcs[leftUserId]?.close();
    _groupPcs.remove(leftUserId);
    _groupParticipants.remove(leftUserId);
    notifyListeners();
  }

  Future<void> _onGroupSignal(dynamic data) async {
    final fromUserId = data['from']?.toString();
    final signal = data['signal'];
    if (fromUserId == null || signal == null) return;

    final type = signal['type'];

    try {
      RTCPeerConnection? pc = _groupPcs[fromUserId];
      if (pc == null) {
        pc = await _createGroupPeerConnection(fromUserId);
        _groupPcs[fromUserId] = pc;
      }

      if (type == 'offer') {
        await pc.setRemoteDescription(RTCSessionDescription(signal['sdp'], signal['type']));
        final answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        _socket.emit('group_signal', {
          'targetUserId': fromUserId,
          'conversationId': _currentCall!.conversationId,
          'signal': {'type': answer.type, 'sdp': answer.sdp},
        });
      } else if (type == 'answer') {
        await pc.setRemoteDescription(RTCSessionDescription(signal['sdp'], signal['type']));
      } else if (type == 'candidate') {
        await pc.addCandidate(RTCIceCandidate(
          signal['candidate'],
          signal['sdpMid'],
          signal['sdpMLineIndex'],
        ));
      }
    } catch (e) {
      debugPrint('Error handling group signal from $fromUserId: $e');
    }
  }

  Future<RTCPeerConnection> _createGroupPeerConnection(String targetUserId) async {
    final config = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
        {'urls': 'stun:stun1.l.google.com:19302'},
      ],
      'sdpSemantics': 'unified-plan',
    };

    final pc = await createPeerConnection(config);

    if (_localStream != null) {
      for (final track in _localStream!.getTracks()) {
        await pc.addTrack(track, _localStream!);
      }
    }

    pc.onIceCandidate = (candidate) {
      if (candidate.candidate == null) return;
      _socket.emit('group_signal', {
        'targetUserId': targetUserId,
        'conversationId': _currentCall!.conversationId,
        'signal': {
          'type': 'candidate',
          'candidate': candidate.candidate,
          'sdpMid': candidate.sdpMid,
          'sdpMLineIndex': candidate.sdpMLineIndex,
        },
      });
    };

    pc.onTrack = (event) {
      debugPrint('🔊 Group call track received from $targetUserId');
    };

    return pc;
  }

  // ─────────────── COMMON WEBRTC & TIMERS ───────────────
  Future<void> _setupPeerConnection(String targetUserId) async {
    await _pc?.close();
    _pc = null;

    final config = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
        {'urls': 'stun:stun1.l.google.com:19302'},
      ],
      'sdpSemantics': 'unified-plan',
    };

    _pc = await createPeerConnection(config);

    _localStream?.dispose();
    _localStream = await navigator.mediaDevices.getUserMedia({'audio': true, 'video': false});

    for (final track in _localStream!.getTracks()) {
      await _pc!.addTrack(track, _localStream!);
    }

    _pc!.onTrack = (RTCTrackEvent event) {
      if (event.streams.isNotEmpty) {
        _remoteStream = event.streams[0];
        _callState = CallState.connected;
        _startDurationTimer();
        notifyListeners();
        onCallConnected?.call();
      }
    };

    _pc!.onIceCandidate = (RTCIceCandidate candidate) {
      if (candidate.candidate == null || _currentCall == null) return;
      _socket.emit('signal', {
        'targetUserId': targetUserId,
        'callId': _currentCall!.callId,
        'signal': {
          'type': 'candidate',
          'candidate': candidate.candidate,
          'sdpMid': candidate.sdpMid,
          'sdpMLineIndex': candidate.sdpMLineIndex,
        },
      });
    };
  }

  void toggleMute() {
    _isMuted = !_isMuted;
    _localStream?.getAudioTracks().forEach((t) => t.enabled = !_isMuted);
    notifyListeners();
  }

  void toggleSpeaker() {
    _isSpeakerOn = !_isSpeakerOn;
    Helper.setSpeakerphoneOn(_isSpeakerOn);
    notifyListeners();
  }

  void _startDurationTimer() {
    _durationTimer?.cancel();
    _callDuration = Duration.zero;
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _callDuration += const Duration(seconds: 1);
      notifyListeners();
    });
  }

  void _resetCall() {
    _autoCancelTimer?.cancel();
    _durationTimer?.cancel();
    _pc?.close();
    _pc = null;

    _groupPcs.forEach((_, pc) => pc.close());
    _groupPcs.clear();
    _groupParticipants.clear();

    _localStream?.dispose();
    _localStream = null;
    _remoteStream?.dispose();
    _remoteStream = null;

    _callState = CallState.idle;
    _currentCall = null;
    _pendingOffer = null;
    _isMuted = false;
    _isSpeakerOn = false;
    _callDuration = Duration.zero;
    notifyListeners();
  }

  String formatDuration(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    _resetCall();
    super.dispose();
  }
}