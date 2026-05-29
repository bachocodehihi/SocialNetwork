import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/chat/user/user_view.dart';

class ChatUserPage extends StatelessWidget {
  final String receiverId;
  final String receiverName;
  final String receiverAvatar;
  final bool isFriend;

  const ChatUserPage({
    super.key,
    required this.receiverId,
    required this.receiverName,
    this.receiverAvatar = '',
    this.isFriend = false,
  });

  @override
  Widget build(BuildContext context) {
    return ChatUserView(
      receiverId: receiverId,
      receiverName: receiverName,
      receiverAvatar: receiverAvatar,
      isFriend: isFriend,
    );
  }
}