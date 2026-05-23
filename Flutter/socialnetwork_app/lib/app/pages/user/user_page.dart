import 'package:flutter/material.dart';
import 'user_view.dart';

class UserPage extends StatelessWidget {
  final Map<String, dynamic>? userData;

  const UserPage({super.key, this.userData});

  @override
  Widget build(BuildContext context) {
    return UserView(userData: userData);
  }
}