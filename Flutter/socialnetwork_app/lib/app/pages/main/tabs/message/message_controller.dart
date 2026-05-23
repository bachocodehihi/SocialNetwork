import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/message_api.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

import 'package:socialnetwork/data/service/socket.dart';

class MessageController extends ChangeNotifier {
  late final MessageApi _messageApi;
  late final ContactApi _contactApi;
  late final SocketService _socketService;

  List<Map<String, dynamic>> conversations = [];
  List<Map<String, dynamic>> onlineFriends = [];
  bool isLoading = false;
  String? currentUserId;
  
  MessageController() {
    final dio = DioClient.createDio();
    _messageApi = MessageApi(dio);
    _contactApi = ContactApi(dio);
    _socketService = SocketService();
    _init();
  }

  Future<void> _init() async {
    currentUserId = await AuthLocal.getUserId();
    
    _socketService.on('conversation_updated', _onConversationUpdated);
    _socketService.on('friend_status_changed', _onFriendStatusChanged);
    
    await refresh();
  }

  void _onConversationUpdated(dynamic data) {
    if (data is! Map<String, dynamic>) return;
    
    final conversationId = data['conversationId'];
    final lastMessage = data['lastMessage'];
    final updatedAt = data['updatedAt'];

    bool found = false;
    for (int i = 0; i < conversations.length; i++) {
      if (conversations[i]['_id'] == conversationId) {
        conversations[i]['lastMessage'] = lastMessage;
        conversations[i]['updatedAt'] = updatedAt;
        found = true;
        break;
      }
    }

    if (!found) {
      refresh();
    } else {
      conversations.sort((a, b) {
        final dateA = DateTime.parse(a['updatedAt'] ?? a['createdAt']);
        final dateB = DateTime.parse(b['updatedAt'] ?? b['createdAt']);
        return dateB.compareTo(dateA);
      });
      notifyListeners();
    }
  }

  void _onFriendStatusChanged(dynamic data) {
    if (data is! Map<String, dynamic>) return;
    final userId = data['userId'];
    final status = data['status'];

    for (var conv in conversations) {
      final members = conv['members'] as List? ?? [];
      for (var member in members) {
        if (member['_id'] == userId) {
          member['isOnline'] = (status == 'online');
        }
      }
    }

    refresh();
  }

  @override
  void dispose() {
    _socketService.off('conversation_updated', _onConversationUpdated);
    _socketService.off('friend_status_changed', _onFriendStatusChanged);
    super.dispose();
  }

  Future<void> refresh() async {
    isLoading = true;
    notifyListeners();
    try {
      conversations = await _messageApi.getConversations();
      
      final friends = await _contactApi.getFriends();
      
      final Map<String, Map<String, dynamic>> uniqueOnlineUsers = {};
      
      for (var conv in conversations) {
        final members = conv['members'] as List? ?? [];
        for (var member in members) {
          if (member['_id'] != currentUserId && member['isOnline'] == true) {
            uniqueOnlineUsers[member['_id']] = member;
          }
        }
      }
      
      for (var friend in friends) {
        if (friend['status'] == 'Online' || friend['isOnline'] == true) {
           uniqueOnlineUsers[friend['_id']] = friend;
        }
      }

      onlineFriends = uniqueOnlineUsers.values.toList();
      
      conversations.sort((a, b) {
        final dateA = DateTime.parse(a['updatedAt'] ?? a['createdAt']);
        final dateB = DateTime.parse(b['updatedAt'] ?? b['createdAt']);
        return dateB.compareTo(dateA);
      });

    } catch (e) {
      debugPrint('Error fetching messages: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  String getDisplayTime(String timestamp) {
    if (timestamp.isEmpty) return '';
    final date = DateTime.parse(timestamp).toLocal();
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else if (diff.inDays < 7) {
      final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days[date.weekday - 1];
    } else {
      return '${date.day}/${date.month}';
    }
  }
}
