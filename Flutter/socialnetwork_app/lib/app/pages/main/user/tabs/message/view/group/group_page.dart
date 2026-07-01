import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/view/group/group_view.dart';
class ViewGroupPage extends StatelessWidget {
  const ViewGroupPage({super.key});
  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    return ViewGroupView(
      conversationId: args['conversationId'] ?? '',
      groupId: args['groupId'] ?? '',
      groupName: args['groupName'] ?? '',
      groupAvatar: args['groupAvatar'] ?? '',
    );
  }
}
