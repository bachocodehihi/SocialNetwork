import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/group/invite/invite_view.dart';

class InvitePage extends StatelessWidget {
  final String groupId;
  final String groupName;

  const InvitePage({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  Widget build(BuildContext context) {
    return InviteView(
      groupId: groupId,
      groupName: groupName,
    );
  }
}
