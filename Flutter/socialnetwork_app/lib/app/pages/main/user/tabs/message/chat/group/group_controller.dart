import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/message_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/message_repository_imp.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:socialnetwork/domain/usecases/message_usecase.dart';

class ChatGroupController extends ChangeNotifier {
  final MessageUsecase _usecase;
  final SocketService _socket;

  String? _conversationId;
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  String? _error;
  String _currentUserId = '';
  final TextEditingController _messageController = TextEditingController();
  Map<String, dynamic>? _pinnedMessage;

  bool _isTyping = false;
  Timer? _typingTimer;
  final Map<String, bool> _typingUsers = {};

  ChatGroupController()
      : _usecase = MessageUsecase(
          MessageRepositoryImp(MessageApi(DioClient.createDio())),
        ),
        _socket = SocketService();

  List<Map<String, dynamic>> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get currentUserId => _currentUserId;
  TextEditingController get messageController => _messageController;
  bool get isTyping => _isTyping;
  Map<String, bool> get typingUsers => _typingUsers;
  Map<String, dynamic>? get pinnedMessage => _pinnedMessage;

  Future<void> init(String conversationId) async {
    _conversationId = conversationId;
    _currentUserId = (await AuthLocal.getUserId()) ?? '';
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _socket.connect();
      _socket.joinRoom(conversationId);
      _setupSocketListeners();
      await fetchMessages();
      
      try {
        final conversations = await _usecase.getConversations();
        final conv = conversations.firstWhere(
          (c) => c['_id']?.toString() == conversationId || c['id']?.toString() == conversationId,
          orElse: () => <String, dynamic>{},
        );
        if (conv.isNotEmpty && conv['pinnedMessage'] != null) {
          _pinnedMessage = Map<String, dynamic>.from(conv['pinnedMessage'] as Map);
        }
      } catch (e) {
        debugPrint('❌ ChatGroupController fetch conversations error: $e');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('❌ ChatGroupController init error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _setupSocketListeners() {
    if (_conversationId == null) return;

    _socket.onReceiveMessage((msg) {
      final senderId = (msg['sender'] is Map)
          ? msg['sender']['_id']?.toString()
          : msg['sender']?.toString();

      if (senderId == _currentUserId) return;

      if (!_messages.any((m) => m['_id'] == msg['_id'])) {
        _messages.add(Map<String, dynamic>.from(msg));
        notifyListeners();
      }
    });

    _socket.on('typing', (data) {
      if (data is Map && data['conversationId'] == _conversationId) {
        final senderId = data['sender']?.toString();
        if (senderId != null && senderId != _currentUserId) {
          _typingUsers[senderId] = true;
          notifyListeners();
        }
      }
    });

    _socket.on('stop_typing', (data) {
      if (data is Map && data['conversationId'] == _conversationId) {
        final senderId = data['sender']?.toString();
        if (senderId != null) {
          _typingUsers.remove(senderId);
          notifyListeners();
        }
      }
    });

    _socket.on('message_pinned', (data) {
      if (data is Map && data['conversationId'] == _conversationId) {
        if (data['pinnedMessage'] != null) {
          _pinnedMessage = Map<String, dynamic>.from(data['pinnedMessage'] as Map);
          notifyListeners();
        }
      }
    });

    _socket.on('message_unpinned', (data) {
      if (data is Map && data['conversationId'] == _conversationId) {
        _pinnedMessage = null;
        notifyListeners();
      }
    });

    _socket.on('error', (data) {
      if (data is Map) {
        _error = data['message']?.toString();
        notifyListeners();
      }
    });
  }

  Future<void> fetchMessages() async {
    if (_conversationId == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _messages = await _usecase.getMessages(_conversationId!);
    } catch (e) {
      _error = e.toString();
      debugPrint('❌ Fetch messages error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchOlderMessages() async {
    if (_conversationId == null || _messages.isEmpty) return;

    final oldestMsg = _messages.first;
    final before = oldestMsg['createdAt'];

    try {
      final older = await _usecase.getMessages(
        _conversationId!,
        before: before,
        limit: 30,
      );
      _messages.insertAll(0, older);
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Fetch older messages error: $e');
    }
  }

  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty || _conversationId == null) return;

    final trimmedContent = content.trim();
    final tempId = 'temp_${DateTime.now().millisecondsSinceEpoch}';

    final tempMsg = {
      '_id': tempId,
      'content': trimmedContent,
      'sender': {
        '_id': _currentUserId,
        'username': 'You',
        'avatar': null,
      },
      'createdAt': DateTime.now().toIso8601String(),
      'type': 'text',
      'isTemp': true,
    };

    _messages.add(tempMsg);
    _messageController.clear();
    _stopTyping();
    notifyListeners();

    try {
      final sentMsg = await _usecase.sendMessage(
        conversationId: _conversationId!,
        content: trimmedContent,
      );

      final idx = _messages.indexWhere((m) => m['_id'] == tempId);
      if (idx != -1) {
        _messages[idx] = Map<String, dynamic>.from(sentMsg)
          ..remove('isTemp');
      }
      notifyListeners();
    } catch (e) {
      final idx = _messages.indexWhere((m) => m['_id'] == tempId);
      if (idx != -1) {
        _messages[idx] = {
          ..._messages[idx],
          'isTemp': false,
          'isFailed': true,
        };
      }
      _error = e.toString();
      debugPrint('❌ Send message error: $e');
      notifyListeners();
    }
  }

  void onTypingChanged(String text) {
    if (_conversationId == null) return;

    if (text.trim().isNotEmpty && !_isTyping) {
      _startTyping();
    } else if (text.trim().isEmpty && _isTyping) {
      _stopTyping();
    }

    _typingTimer?.cancel();
    if (text.trim().isNotEmpty) {
      _typingTimer = Timer(const Duration(seconds: 2), _stopTyping);
    }
  }

  void _startTyping() {
    if (_isTyping) return;
    _isTyping = true;
    _socket.sendTyping(_conversationId!);
    notifyListeners();
  }

  void _stopTyping() {
    if (!_isTyping) return;
    _isTyping = false;
    _typingTimer?.cancel();
    _socket.sendStopTyping(_conversationId!);
    notifyListeners();
  }

  bool isMessageFromMe(Map<String, dynamic> msg) {
    final senderId = msg['sender']?['_id']?.toString() ??
        msg['sender']?['id']?.toString();
    return senderId == _currentUserId;
  }

  @override
  void dispose() {
    if (_conversationId != null) {
      _socket.leaveRoom(_conversationId!);
      _socket.off('receive_message');
      _socket.off('typing');
      _socket.off('stop_typing');
      _socket.off('message_pinned');
      _socket.off('message_unpinned');
      _socket.off('error');
    }
    _typingTimer?.cancel();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> pinMessage(String messageId) async {
    if (_conversationId == null) return;
    try {
      final res = await _usecase.pinMessage(_conversationId!, messageId);
      if (res['success'] == true && res['pinnedMessage'] != null) {
        _pinnedMessage = Map<String, dynamic>.from(res['pinnedMessage'] as Map);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('❌ Error pinning message: $e');
    }
  }

  Future<void> unpinMessage() async {
    if (_conversationId == null) return;
    try {
      final res = await _usecase.unpinMessage(_conversationId!);
      if (res['success'] == true) {
        _pinnedMessage = null;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('❌ Error unpinning message: $e');
    }
  }
}