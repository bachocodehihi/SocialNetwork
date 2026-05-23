import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/group/group_view.dart';

class GroupPage extends StatelessWidget {
  final String groupId;

  const GroupPage({super.key, required this.groupId});

  @override
  Widget build(BuildContext context) {
    return GroupView(groupId: groupId);
  }
}
