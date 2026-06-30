import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/list/member/member_view.dart';
class ListMemberPage extends StatelessWidget {
  const ListMemberPage({super.key});
  @override
  Widget build(BuildContext context) {
    final String groupId = ModalRoute.of(context)!.settings.arguments as String;
    return ListMemberView(groupId: groupId);
  }
}
