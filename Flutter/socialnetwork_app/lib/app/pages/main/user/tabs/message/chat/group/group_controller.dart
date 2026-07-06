import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/message_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/message_repository_imp.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:socialnetwork/data/service/sound.dart';
import 'package:socialnetwork/domain/usecases/message_usecase.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ChatGroupController extends ChangeNotifier {
  final MessageUsecase _usecase;
  final SocketService _socket;
  final SoundService _soundService = SoundService();

  String? _conversationId;
  String? _groupId;
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  bool _isSending = false;
  String? _error;
  String _currentUserId = '';
  final TextEditingController _messageController = TextEditingController();
  Map<String, dynamic>? _pinnedMessage;
  Map<String, dynamic>? _replyingMessage;
  Map<String, dynamic>? _editingMessage;

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
  bool get isSending => _isSending;
  String? get error => _error;
  String get currentUserId => _currentUserId;
  TextEditingController get messageController => _messageController;
  bool get isTyping => _isTyping;
  Map<String, bool> get typingUsers => _typingUsers;
  Map<String, dynamic>? get pinnedMessage => _pinnedMessage;
  Map<String, dynamic>? get replyingMessage => _replyingMessage;
  Map<String, dynamic>? get editingMessage => _editingMessage;
  String? get groupId => _groupId;
  String? get conversationId => _conversationId;

  void startReply(Map<String, dynamic> message) {
    _replyingMessage = message;
    _editingMessage = null;
    notifyListeners();
  }

  void cancelReply() {
    _replyingMessage = null;
    notifyListeners();
  }

  void startEdit(Map<String, dynamic> message) {
    _editingMessage = message;
    _replyingMessage = null;
    notifyListeners();
  }

  void cancelEdit() {
    _editingMessage = null;
    notifyListeners();
  }

  String? _extractSenderId(dynamic senderRaw) {
    if (senderRaw is Map) {
      return senderRaw['_id']?.toString() ?? senderRaw['id']?.toString();
    }
    return senderRaw?.toString();
  }

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
        if (conv.isNotEmpty) {
          if (conv['pinnedMessage'] != null) {
            _pinnedMessage = Map<String, dynamic>.from(conv['pinnedMessage'] as Map);
          }
          if (conv['meta'] != null && conv['meta']['groupId'] != null) {
            _groupId = conv['meta']['groupId'].toString();
          }
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

  void _onReceiveMessage(dynamic data) {
    final msgConvId = data['conversationId']?.toString();
    if (msgConvId != _conversationId) return;
    
    final realMsgId = data['_id']?.toString() ?? data['id']?.toString();
    if (realMsgId == null) return;
    
    final senderId = _extractSenderId(data['sender']);
    
    final exists = _messages.any((m) {
      final mid = m['_id']?.toString() ?? m['id']?.toString();
      return mid == realMsgId;
    });
    
    if (!exists) {
      _messages.add(Map<String, dynamic>.from(data));
      if (senderId != _currentUserId) {
        _soundService.playMessageReceived();
      }
      notifyListeners();
    }
  }

  void _onMessageRecalled(dynamic data) {
    final msgId = data['messageId']?.toString();
    if (msgId == null) return;
    final index = _messages.indexWhere((m) {
      final mid = m['_id']?.toString() ?? m['id']?.toString();
      return mid == msgId;
    });
    if (index != -1) {
      _messages[index] = {
        ..._messages[index],
        'isRecalled': true,
        'content': 'Tin nhắn đã bị thu hồi',
      };
      notifyListeners();
    }
  }

  void _onMessageEdited(dynamic data) {
    final msgConvId = data['conversationId']?.toString();
    if (msgConvId != _conversationId) return;

    final realMsgId = data['_id']?.toString() ?? data['id']?.toString();
    if (realMsgId == null) return;

    final index = _messages.indexWhere((m) {
      final mid = m['_id']?.toString() ?? m['id']?.toString();
      return mid == realMsgId;
    });

    if (index != -1) {
      _messages[index] = Map<String, dynamic>.from(data);
      if (_pinnedMessage != null) {
        final pinnedId = _pinnedMessage!['_id']?.toString() ?? _pinnedMessage!['id']?.toString();
        if (pinnedId == realMsgId) {
          _pinnedMessage = Map<String, dynamic>.from(data);
        }
      }
      notifyListeners();
    }
  }

  void _onMessagePinned(dynamic data) {
    final msgConvId = data['conversationId']?.toString();
    if (msgConvId != _conversationId) return;
    if (data['pinnedMessage'] != null) {
      _pinnedMessage = Map<String, dynamic>.from(data['pinnedMessage'] as Map);
      notifyListeners();
    }
  }

  void _onMessageUnpinned(dynamic data) {
    final msgConvId = data['conversationId']?.toString();
    if (msgConvId != _conversationId) return;
    _pinnedMessage = null;
    notifyListeners();
  }

  void _setupSocketListeners() {
    if (_conversationId == null) return;

    _socket.on('receive_message', _onReceiveMessage);
    _socket.on('message_recalled', _onMessageRecalled);
    _socket.on('message_edited', _onMessageEdited);
    _socket.on('message_pinned', _onMessagePinned);
    _socket.on('message_unpinned', _onMessageUnpinned);

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
    final replyId = _replyingMessage?['_id']?.toString() ?? _replyingMessage?['id']?.toString();
    _replyingMessage = null;
    _isSending = true;
    _stopTyping();
    notifyListeners();

    try {
      _socket.emit('send_message', {
        'conversationId': _conversationId,
        'content': trimmedContent,
        'type': 'text',
        if (replyId != null) 'repliedTo': replyId,
      });
    } catch (e) {
      _error = 'Gửi tin nhắn thất bại: ${e.toString()}';
      debugPrint('❌ Send message error: $e');
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Future<void> sendImageMessages(List<String> filePaths) async {
    if (filePaths.isEmpty || _conversationId == null) return;
    
    final replyId = _replyingMessage?['_id']?.toString() ?? _replyingMessage?['id']?.toString();
    _replyingMessage = null;
    _isSending = true;
    notifyListeners();
 
    try {
      final List<String> imageUrls = [];
      for (final path in filePaths) {
        final imageUrl = await _usecase.uploadImage(path);
        if (imageUrl != null) {
          imageUrls.add(imageUrl);
        }
      }

      if (imageUrls.isNotEmpty) {
        _socket.emit('send_message', {
          'conversationId': _conversationId,
          'content': '[Hình ảnh]',
          'type': 'image',
          'attachments': imageUrls,
          if (replyId != null) 'repliedTo': replyId,
        });
      } else {
        _error = 'Tải ảnh lên thất bại';
      }
    } catch (e) {
      _error = 'Gửi hình ảnh thất bại: ${e.toString()}';
      debugPrint('❌ Send images error: $e');
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Future<void> sendVoiceMessage(String filePath) async {
    if (_conversationId == null) return;
    
    final replyId = _replyingMessage?['_id']?.toString() ?? _replyingMessage?['id']?.toString();
    _replyingMessage = null;
    _isSending = true;
    notifyListeners();
 
    try {
      final audioUrl = await _usecase.uploadAudio(filePath);
      if (audioUrl != null) {
        _socket.emit('send_message', {
          'conversationId': _conversationId,
          'content': '[Tin nhắn thoại]',
          'type': 'audio',
          'attachments': [audioUrl],
          if (replyId != null) 'repliedTo': replyId,
        });
      } else {
        _error = 'Tải tin nhắn thoại lên thất bại';
      }
    } catch (e) {
      _error = 'Gửi tin nhắn thoại thất bại: ${e.toString()}';
      debugPrint('❌ Send voice error: $e');
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Future<void> sendFileMessage(String filePath, String fileName) async {
    if (_conversationId == null) return;
    
    final replyId = _replyingMessage?['_id']?.toString() ?? _replyingMessage?['id']?.toString();
    _replyingMessage = null;
    _isSending = true;
    notifyListeners();
 
    try {
      final file = File(filePath);
      final sanitizedName = _sanitizeFileName(fileName);
      final uniqueFileName = "${DateTime.now().millisecondsSinceEpoch}_$sanitizedName";
      
      final supabase = Supabase.instance.client;
      await supabase.storage.from('documents').upload(
        uniqueFileName,
        file,
      );

      final String publicUrl = supabase.storage.from('documents').getPublicUrl(uniqueFileName);

      if (publicUrl.isNotEmpty) {
        _socket.emit('send_message', {
          'conversationId': _conversationId,
          'content': fileName,
          'type': 'file',
          'attachments': [publicUrl],
          if (replyId != null) 'repliedTo': replyId,
        });
      } else {
        _error = 'Tải file lên thất bại';
      }
    } catch (e) {
      _error = 'Gửi file thất bại: ${e.toString()}';
      debugPrint('❌ Send file error: $e');
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Future<void> deleteMessage(String messageId) async {
    try {
      await _usecase.deleteMessage(messageId, forEveryone: false);
      _messages.removeWhere((m) {
        final mid = m['_id']?.toString() ?? m['id']?.toString();
        return mid == messageId;
      });
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error deleting message: $e');
    }
  }

  Future<void> recallMessage(String messageId) async {
    try {
      await _usecase.deleteMessage(messageId, forEveryone: true);
      final index = _messages.indexWhere((m) {
        final mid = m['_id']?.toString() ?? m['id']?.toString();
        return mid == messageId;
      });
      if (index != -1) {
        _messages[index] = {
          ..._messages[index],
          'isRecalled': true,
          'content': 'Tin nhắn đã bị thu hồi',
        };
        notifyListeners();
      }
    } catch (e) {
      debugPrint('❌ Error recalling message: $e');
    }
  }

  Future<bool> updateMessage(String messageId, String newContent) async {
    if (newContent.trim().isEmpty) return false;
    try {
      final res = await _usecase.editMessage(messageId: messageId, content: newContent.trim());
      if (res['success'] == true) {
        final index = _messages.indexWhere((m) {
          final mid = m['_id']?.toString() ?? m['id']?.toString();
          return mid == messageId;
        });
        if (index != -1) {
          _messages[index] = Map<String, dynamic>.from(res);
          if (_pinnedMessage != null) {
            final pinnedId = _pinnedMessage!['_id']?.toString() ?? _pinnedMessage!['id']?.toString();
            if (pinnedId == messageId) {
              _pinnedMessage = Map<String, dynamic>.from(res);
            }
          }
        }
        _editingMessage = null;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('❌ Error editing message: $e');
      _error = 'Lỗi sửa tin nhắn: $e';
      notifyListeners();
      return false;
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
      _socket.off('receive_message', _onReceiveMessage);
      _socket.off('message_recalled', _onMessageRecalled);
      _socket.off('message_edited', _onMessageEdited);
      _socket.off('message_pinned', _onMessagePinned);
      _socket.off('message_unpinned', _onMessageUnpinned);
      _socket.off('typing');
      _socket.off('stop_typing');
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

  String _sanitizeFileName(String name) {
    const vietnamese = 'aAeEoOuUiIdDyY';
    final vietnameseRegex = [
      RegExp(r'[àáạảãâầấậẩẫăằắặẳẵ]'),
      RegExp(r'[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]'),
      RegExp(r'[èéẹẻẽêềếệểễ]'),
      RegExp(r'[ÈÉẸẺẼÊỀẾỆỂỄ]'),
      RegExp(r'[òóọỏõôồốộổỗơờớợởỡ]'),
      RegExp(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]'),
      RegExp(r'[ùúụủũưừứựửữ]'),
      RegExp(r'[ÙÚỤỦŨƯỪỨỰỬỮ]'),
      RegExp(r'[ìíịỉĩ]'),
      RegExp(r'[ÌÍỊỈĨ]'),
      RegExp(r'[đ]'),
      RegExp(r'[Đ]'),
      RegExp(r'[ỳýỵỷỹ]'),
      RegExp(r'[ỲÝỴỶỸ]')
    ];

    String result = name;
    for (int i = 0; i < vietnameseRegex.length; i++) {
      result = result.replaceAll(vietnameseRegex[i], vietnamese[i]);
    }

    result = result.replaceAll(RegExp(r'\s+'), '_');
    result = result.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '');
    return result;
  }

  Future<Map<String, dynamic>> getLinkPreview(String url) async {
    try {
      return await _usecase.getLinkPreview(url);
    } catch (e) {
      debugPrint('Error getting link preview: $e');
      return {};
    }
  }
}