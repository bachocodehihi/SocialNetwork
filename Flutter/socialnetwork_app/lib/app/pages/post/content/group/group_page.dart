import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/post/content/group/group_view.dart';

class GroupPostContentPage extends StatelessWidget {
  final String groupId;
  final String groupName;

  const GroupPostContentPage({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  Widget build(BuildContext context) {
    return GroupPostContentView(
      groupId: groupId,
      groupName: groupName,
    );
  }
}
