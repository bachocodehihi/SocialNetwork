import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/select/friend/friend_view.dart';

class SelectFriendPage extends StatelessWidget {
  final String title;
  final List<String> initialSelectedIds;

  const SelectFriendPage({
    super.key,
    required this.title,
    this.initialSelectedIds = const [],
  });

  @override
  Widget build(BuildContext context) {
    return SelectFriendView(
      title: title,
      initialSelectedIds: initialSelectedIds,
    );
  }
}
