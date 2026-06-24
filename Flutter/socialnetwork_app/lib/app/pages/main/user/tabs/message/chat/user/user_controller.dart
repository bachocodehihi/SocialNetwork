import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:socialnetwork/domain/usecases/message_usecase.dart';
import 'package:socialnetwork/data/repositories/message_repository_imp.dart';
import 'package:socialnetwork/data/network/api/message_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/service/sound.dart';
class ChatUserController extends ChangeNotifier {
  final String receiverId;
  final String receiverName;
  final String receiverAvatar;
  final bool isFriend;
  
  final _socketService = SocketService();
  final _soundService = SoundService();
  late final MessageUsecase _messageUsecase;
 
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  bool _isSending = false;
  String? _error;
  String _currentUserId = '';
  String _receiverStatus = 'offline';
  String? _conversationId;
  Map<String, dynamic>? _pinnedMessage;
  Map<String, dynamic>? _replyingMessage;
  
  void Function(dynamic)? _statusListener;
  void Function(dynamic)? _messageListener;
  void Function(dynamic)? _recallListener;
  void Function(dynamic)? _pinListener;
  void Function(dynamic)? _unpinListener;
 
  ChatUserController({
    required this.receiverId,
    required this.receiverName,
    this.receiverAvatar = '',
    this.isFriend = false,
  }) {
    final api = MessageApi(DioClient.createDio());
    final repo = MessageRepositoryImp(api);
    _messageUsecase = MessageUsecase(repo);
    _init();
  }
 
  List<Map<String, dynamic>> get messages => List.unmodifiable(_messages);
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  String? get error => _error;
  String get currentUserId => _currentUserId;
  String get receiverStatus => _receiverStatus;
  bool get isReceiverOnline => _receiverStatus == 'online';
  String? get conversationId => _conversationId;
  Map<String, dynamic>? get pinnedMessage => _pinnedMessage;
  Map<String, dynamic>? get replyingMessage => _replyingMessage;

  void startReply(Map<String, dynamic> message) {
    _replyingMessage = message;
    notifyListeners();
  }

  void cancelReply() {
    _replyingMessage = null;
    notifyListeners();
  }
 
  String? _extractSenderId(dynamic senderRaw) {
    if (senderRaw is Map) {
      return senderRaw['_id']?.toString() ?? senderRaw['id']?.toString();
    }
    return senderRaw?.toString();
  }
 
  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();
 
    try {
      final user = await AuthLocal.getCurrentUser();
      _currentUserId = user?['_id']?.toString() ?? user?['id']?.toString() ?? '';
      
      final conv = await _messageUsecase.createConversation(
        receiverId: receiverId,
        isGroup: false,
      );
      _conversationId = conv['_id']?.toString() ?? conv['id']?.toString();
      
      if (_conversationId == null && conv['conversation'] != null) {
        final innerConv = conv['conversation'] as Map;
        _conversationId = innerConv['_id']?.toString() ?? innerConv['id']?.toString();
      }
      
      final Map<String, dynamic> convData = conv['conversation'] != null 
          ? Map<String, dynamic>.from(conv['conversation'] as Map) 
          : Map<String, dynamic>.from(conv);
      if (convData['pinnedMessage'] != null) {
        _pinnedMessage = Map<String, dynamic>.from(convData['pinnedMessage'] as Map);
      }
      
      if (_conversationId == null) {
        _error = 'Không thể tạo conversation';
        _isLoading = false;
        notifyListeners();
        return;
      }
      
      _socketService.emit('join_room', _conversationId);
      
      _messageListener = _onReceiveMessage;
      _socketService.on('receive_message', _messageListener!);
      
      _recallListener = _onMessageRecalled;
      _socketService.on('message_recalled', _recallListener!);

      _pinListener = _onMessagePinned;
      _socketService.on('message_pinned', _pinListener!);

      _unpinListener = _onMessageUnpinned;
      _socketService.on('message_unpinned', _unpinListener!);
      
      await _loadMessages();
      
      if (isFriend) {
        _statusListener = _onFriendStatusChanged;
        _socketService.on('friend_status_changed', _statusListener!);
        _socketService.emit('check_friend_status', receiverId);
      }
      
    } catch (e) {
      _error = 'Lỗi khởi tạo: ${e.toString()}';
      debugPrint('Init error: $e');
    }
 
    _isLoading = false;
    notifyListeners();
  }
 
  Future<void> _loadMessages() async {
    if (_conversationId == null) return;
    try {
      final msgs = await _messageUsecase.getMessages(_conversationId!);
      _messages = msgs;
    } catch (e) {
      debugPrint('Load messages error: $e');
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

  void _onReceiveMessage(dynamic data) {
    final msgConvId = data['conversationId']?.toString();
    if (msgConvId != _conversationId) return;
    
    final realMsgId = data['_id']?.toString() ?? data['id']?.toString();
    if (realMsgId == null) return;
    
    final senderId = _extractSenderId(data['sender']);
    final content = data['content']?.toString() ?? '';
    
    final tempIndex = _messages.indexWhere((m) {
      final mid = m['_id']?.toString() ?? '';
      final mSenderId = _extractSenderId(m['sender']);
      final mContent = m['content']?.toString() ?? '';
      
      return mid.startsWith('temp_') &&
             mSenderId == _currentUserId &&
             senderId == _currentUserId &&
             mContent == content;
    });
    
    if (tempIndex != -1) {
      _messages.removeAt(tempIndex);
    }
    
    final exists = _messages.any((m) {
      final mid = m['_id']?.toString() ?? m['id']?.toString();
      return mid == realMsgId;
    });
    
    if (!exists) {
      _messages.add(data);
        if (senderId != _currentUserId) {
        _soundService.playMessageReceived();
      }
      notifyListeners();
    }
  }
 
  void _onFriendStatusChanged(dynamic data) {
    final userIdStr = data['userId']?.toString() ?? '';
    final status = data['status'] as String?;
    if (userIdStr == receiverId && status != null) {
      _receiverStatus = status;
      notifyListeners();
    }
  }
 
  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty || _conversationId == null) return;
    
    final replyId = _replyingMessage?['_id']?.toString() ?? _replyingMessage?['id']?.toString();
    _replyingMessage = null;
    _isSending = true;
    notifyListeners();
 
    try {
      _socketService.emit('send_message', {
        'conversationId': _conversationId,
        'content': content.trim(),
        'type': 'text',
        if (replyId != null) 'repliedTo': replyId,
      });
    } catch (e) {
      _error = 'Gửi tin nhắn thất bại: ${e.toString()}';
    }
 
    _isSending = false;
    notifyListeners();
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
        final imageUrl = await _messageUsecase.uploadImage(path);
        if (imageUrl != null) {
          imageUrls.add(imageUrl);
        }
      }

      if (imageUrls.isNotEmpty) {
        _socketService.emit('send_message', {
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
    }
 
    _isSending = false;
    notifyListeners();
  }

  Future<void> sendVoiceMessage(String filePath) async {
    if (_conversationId == null) return;
    
    final replyId = _replyingMessage?['_id']?.toString() ?? _replyingMessage?['id']?.toString();
    _replyingMessage = null;
    _isSending = true;
    notifyListeners();
 
    try {
      final audioUrl = await _messageUsecase.uploadAudio(filePath);
      if (audioUrl != null) {
        _socketService.emit('send_message', {
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
    }
 
    _isSending = false;
    notifyListeners();
  }
 
  @override
  void dispose() {
    if (_messageListener != null) {
      _socketService.off('receive_message', _messageListener);
    }
    if (_recallListener != null) {
      _socketService.off('message_recalled', _recallListener);
    }
    if (_pinListener != null) {
      _socketService.off('message_pinned', _pinListener);
    }
    if (_unpinListener != null) {
      _socketService.off('message_unpinned', _unpinListener);
    }
    if (isFriend && _statusListener != null) {
      _socketService.off('friend_status_changed', _statusListener);
    }
    super.dispose();
  }
 
  Future<void> deleteMessage(String messageId) async {
    try {
      await _messageUsecase.deleteMessage(messageId, forEveryone: false);
      _messages.removeWhere((m) {
        final mid = m['_id']?.toString() ?? m['id']?.toString();
        return mid == messageId;
      });
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting message: $e');
    }
  }

  Future<void> recallMessage(String messageId) async {
    try {
      await _messageUsecase.deleteMessage(messageId, forEveryone: true);
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
      debugPrint('Error recalling message: $e');
    }
  }

  Future<void> retryLoad() async => _init();
  Future<void> refresh() async {
    await _loadMessages();
    notifyListeners();
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

  Future<void> pinMessage(String messageId) async {
    if (_conversationId == null) return;
    try {
      final res = await _messageUsecase.pinMessage(_conversationId!, messageId);
      if (res['success'] == true && res['pinnedMessage'] != null) {
        _pinnedMessage = Map<String, dynamic>.from(res['pinnedMessage'] as Map);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error pinning message: $e');
    }
  }

  Future<void> unpinMessage() async {
    if (_conversationId == null) return;
    try {
      final res = await _messageUsecase.unpinMessage(_conversationId!);
      if (res['success'] == true) {
        _pinnedMessage = null;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error unpinning message: $e');
    }
  }
}