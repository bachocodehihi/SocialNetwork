import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/view/user/user_view.dart';
class ViewUserPage extends StatelessWidget {
  final String? userId;
  final String? userName;
  final String? userAvatar;

  const ViewUserPage({
    super.key,
    this.userId,
    this.userName,
    this.userAvatar,
  });

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final id = userId ?? args?['userId'] ?? '';
    final name = userName ?? args?['userName'] ?? '';
    final avatar = userAvatar ?? args?['userAvatar'] ?? '';

    return ViewUserView(
      userId: id,
      userName: name,
      userAvatar: avatar,
    );
  }
}
  