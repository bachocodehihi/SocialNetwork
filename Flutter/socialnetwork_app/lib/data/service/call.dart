import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:permission_handler/permission_handler.dart';

const String agoraAppId = '63c3b289a0ad46fb90f74f68554f4a9f';

enum CallState { idle, ringing, calling, connected, ended }

class CallInfo {
  final String callId;
  final String conversationId;
  final String callType;
  final Map<String, dynamic> remoteUser;
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
  bool _isInitialized = false;

  CallState _callState = CallState.idle;
  CallInfo? _currentCall;
  bool _isMuted = false;
  bool _isSpeakerOn = false;
  Duration _callDuration = Duration.zero;
  Timer? _durationTimer;
  Timer? _autoCancelTimer;

  String? pendingNotificationAction;
  Map<String, dynamic>? _pendingOffer;

  RtcEngine? _engine;
  bool _isJoined = false;
  int? _remoteUid;
  final List<int> _groupRemoteUids = [];

  RtcEngine? get agoraEngine => _engine;
  int? get remoteUid => _remoteUid;
  List<int> get groupRemoteUids => _groupRemoteUids;

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

  Future<void> init() async {
    if (_isInitialized) return;
    _registerListeners();
    _isInitialized = true;
    debugPrint('✅ CallService initialized with Agora');
  }

  void _registerListeners() {
    final events = [
      'call_incoming',
      'call_accepted',
      'call_rejected',
      'call_cancelled',
      'call_ended',
      'call_busy',
      'call_error',
      'signal',
      'group_call_incoming',
      'group_call_user_joined',
      'group_call_user_left',
      'group_signal',
      'disconnect'
    ];
    for (final event in events) {
      _socket.off(event);
    }

    _socket.on('call_incoming', _onCallIncoming);
    _socket.on('call_accepted', _onCallAccepted);
    _socket.on('call_rejected', _onCallRejected);
    _socket.on('call_cancelled', _onCallCancelled);
    _socket.on('call_ended', _onCallEnded);
    _socket.on('call_busy', _onCallBusy);
    _socket.on('call_error', _onCallError);
    _socket.on('signal', _onSignal);

    _socket.on('group_call_incoming', _onGroupCallIncoming);
    _socket.on('group_call_user_joined', _onGroupCallUserJoined);
    _socket.on('group_call_user_left', _onGroupCallUserLeft);
    _socket.on('group_signal', _onGroupSignal);

    _socket.on('disconnect', (_) {
      debugPrint('🔌 CallService: Socket disconnected. Resetting call state.');
      _resetCall();
    });
  }

  Future<bool> _requestPermissions() async {
    if (kIsWeb) return true;
    try {
      final isVideo = _currentCall?.callType == 'video';
      
      final micStatus = await Permission.microphone.request();
      if (!micStatus.isGranted) {
        debugPrint('❌ Microphone permission denied');
        onCallError?.call('Bạn cần cấp quyền truy cập Micro để thực hiện cuộc gọi');
        return false;
      }
      
      if (isVideo) {
        final camStatus = await Permission.camera.request();
        if (!camStatus.isGranted) {
          debugPrint('❌ Camera permission denied');
          onCallError?.call('Bạn cần cấp quyền truy cập Camera để thực hiện cuộc gọi video');
          return false;
        }
      }
      return true;
    } catch (e) {
      debugPrint('⚠️ Permissions check failed: $e');
      return true;
    }
  }

  Future<void> _initAgoraEngine() async {
    if (_engine != null) return;
    try {
      _engine = createAgoraRtcEngine();
      await _engine!.initialize(const RtcEngineContext(
        appId: agoraAppId,
        channelProfile: ChannelProfileType.channelProfileCommunication,
      ));

      _engine!.registerEventHandler(
        RtcEngineEventHandler(
          onJoinChannelSuccess: (RtcConnection connection, int elapsed) {
            debugPrint("🟢 Local user joined Agora channel: ${connection.channelId}");
            _isJoined = true;
            notifyListeners();
          },
          onUserJoined: (RtcConnection connection, int remoteUid, int elapsed) {
            debugPrint("🔊 Remote user joined Agora: $remoteUid");
            if (_currentCall?.isGroup == true) {
              if (!_groupRemoteUids.contains(remoteUid)) {
                _groupRemoteUids.add(remoteUid);
              }
            } else {
              _remoteUid = remoteUid;
              _callState = CallState.connected;
              _startDurationTimer();
              onCallConnected?.call();
            }
            notifyListeners();
          },
          onUserOffline: (RtcConnection connection, int remoteUid, UserOfflineReasonType reason) {
            debugPrint("🔴 Remote user went offline: $remoteUid");
            if (_currentCall?.isGroup == true) {
              _groupRemoteUids.remove(remoteUid);
              if (_groupRemoteUids.isEmpty) {
                endCall();
              }
            } else {
              if (_remoteUid == remoteUid) {
                endCall();
              }
            }
            notifyListeners();
          },
          onLeaveChannel: (RtcConnection connection, RtcStats stats) {
            debugPrint("⏹️ Local user left Agora channel");
            _isJoined = false;
            _remoteUid = null;
            _groupRemoteUids.clear();
            notifyListeners();
          },
          onError: (ErrorCodeType err, String msg) {
            debugPrint("⚠️ Agora Error: [$err] $msg");
            onCallError?.call("Lỗi kết nối cuộc gọi. Vui lòng thử lại sau.");
          },
        ),
      );
    } catch (e) {
      debugPrint("❌ Failed to initialize Agora Engine: $e");
    }
  }

  Future<void> startCall({
    required String receiverId,
    required String conversationId,
    required Map<String, dynamic> receiverInfo,
  }) async {
    if (_callState != CallState.idle) {
      debugPrint('⚠️ CallService state was not idle ($_callState). Force resetting before starting.');
      _resetCall();
    }

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

      await _setupAgoraAndJoin(conversationId);

      _socket.emit('call_initiate', {
        'receiverId': receiverId,
        'conversationId': conversationId,
        'callType': 'voice',
        'offer': {'type': 'offer', 'sdp': 'agora'}, 
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

    if (pendingNotificationAction == 'accept_call') {
      pendingNotificationAction = null;
      acceptCall();
      return;
    } else if (pendingNotificationAction == 'reject_call') {
      pendingNotificationAction = null;
      rejectCall();
      return;
    }

    onIncomingCall?.call(_currentCall!);
  }

  Future<void> acceptCall() async {
    if (_currentCall == null || _callState != CallState.ringing) return;

    _callState = CallState.calling;
    notifyListeners();

    try {
      await _setupAgoraAndJoin(_currentCall!.conversationId);

      _socket.emit('call_accept', {
        'callId': _currentCall!.callId,
        'answer': {'type': 'answer', 'sdp': 'agora'},
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

  void _onSignal(dynamic data) {}

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

      await _setupAgoraAndJoin(conversationId);

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
      callType: data['callType'] ?? 'voice',
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
      _socket.emit('group_call_join', {
        'conversationId': _currentCall!.conversationId,
      });

      await _setupAgoraAndJoin(_currentCall!.conversationId);

      _startDurationTimer();
      _callState = CallState.connected;
      notifyListeners();
    } catch (e) {
      debugPrint('❌ acceptGroupCall error: $e');
      _resetCall();
    }
  }

  void _onGroupCallUserJoined(dynamic data) {
    debugPrint('👥 User joined group call: ${data['userId']}');
  }

  void _onGroupCallUserLeft(dynamic data) {
    final leftUserId = data['userId']?.toString();
    debugPrint('👥 User left group call: $leftUserId');
  }

  void _onGroupSignal(dynamic data) {}

  Future<void> _setupAgoraAndJoin(String channelId) async {
    final hasPermission = await _requestPermissions();
    if (!hasPermission) {
      throw Exception('Camera or Microphone permission not granted');
    }

    await _initAgoraEngine();

    final isVideo = _currentCall?.callType == 'video';
    if (isVideo) {
      await _engine!.enableVideo();
      await _engine!.startPreview();
    } else {
      await _engine!.enableAudio();
      await _engine!.disableVideo();
    }

    await _engine!.joinChannel(
      token: '',
      channelId: channelId,
      uid: 0,
      options: ChannelMediaOptions(
        clientRoleType: ClientRoleType.clientRoleBroadcaster,
        channelProfile: ChannelProfileType.channelProfileCommunication,
        publishCameraTrack: isVideo,
        publishMicrophoneTrack: true,
      ),
    );
  }

  void toggleMute() {
    _isMuted = !_isMuted;
    _engine?.muteLocalAudioStream(_isMuted);
    notifyListeners();
  }

  void toggleSpeaker() {
    _isSpeakerOn = !_isSpeakerOn;
    _engine?.setEnableSpeakerphone(_isSpeakerOn);
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
    
    _engine?.leaveChannel();
    _engine?.release();
    _engine = null;
    
    _isJoined = false;
    _remoteUid = null;
    _groupRemoteUids.clear();

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