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

  // Typing indicator
  bool _isTyping = false;
  Timer? _typingTimer;
  final Map<String, bool> _typingUsers = {};

  ChatGroupController()
      : _usecase = MessageUsecase(
          MessageRepositoryImp(MessageApi(DioClient.createDio())),
        ),
        _socket = SocketService();

  // ========== Getters ==========
  List<Map<String, dynamic>> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get currentUserId => _currentUserId;
  TextEditingController get messageController => _messageController;
  bool get isTyping => _isTyping;
  Map<String, bool> get typingUsers => _typingUsers;

  // ========== Initialization ==========

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

    // ✅ FIX: Socket nhận message từ người KHÁC, không nhận lại của mình
    // vì mình đã thêm optimistic message khi gửi
    _socket.onReceiveMessage((msg) {
      final senderId = (msg['sender'] is Map)
          ? msg['sender']['_id']?.toString()
          : msg['sender']?.toString();

      // Bỏ qua nếu là tin nhắn của chính mình (tránh trùng với optimistic)
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

    _socket.on('error', (data) {
      if (data is Map) {
        _error = data['message']?.toString();
        notifyListeners();
      }
    });
  }

  // ========== Message Operations ==========

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

    // ✅ 1. Thêm optimistic message (hiển thị ngay)
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
      // ✅ 2. Chỉ gọi API (server sẽ emit socket đến người khác)
      // KHÔNG emit socket ở đây để tránh duplicate
      final sentMsg = await _usecase.sendMessage(
        conversationId: _conversationId!,
        content: trimmedContent,
      );

      // ✅ 3. Thay thế optimistic message bằng message thật từ server
      final idx = _messages.indexWhere((m) => m['_id'] == tempId);
      if (idx != -1) {
        _messages[idx] = Map<String, dynamic>.from(sentMsg)
          ..remove('isTemp');
      }
      notifyListeners();
    } catch (e) {
      // ✅ 4. Nếu lỗi, đánh dấu failed
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
      _socket.off('error');
    }
    _typingTimer?.cancel();
    _messageController.dispose();
    super.dispose();
  }
}