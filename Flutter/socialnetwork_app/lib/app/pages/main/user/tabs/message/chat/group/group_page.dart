import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/chat/group/group_view.dart';
class ChatGroupPage extends StatelessWidget {
  final String conversationId;
  final String groupName;
  final String groupAvatar;

  const ChatGroupPage({
    super.key,
    required this.conversationId,
    required this.groupName,
    required this.groupAvatar,
  });

  @override
  Widget build(BuildContext context) {
    return ChatGroupView(
      conversationId: conversationId,
      groupName: groupName,
      groupAvatar: groupAvatar,
    );
  }
}