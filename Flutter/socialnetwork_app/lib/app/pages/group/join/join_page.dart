import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/group/join/join_view.dart';

class JoinGroupPage extends StatelessWidget {
  final String inviteCode;
  final Map<String, dynamic> groupData;

  const JoinGroupPage({
    super.key,
    required this.inviteCode,
    required this.groupData,
  });

  @override
  Widget build(BuildContext context) {
    return JoinGroupView(inviteCode: inviteCode, groupData: groupData);
  }
}
