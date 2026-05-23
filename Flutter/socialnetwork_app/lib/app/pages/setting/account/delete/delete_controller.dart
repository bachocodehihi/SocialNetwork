import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class DeleteController extends ChangeNotifier {

  Future<void> verifyPassword(BuildContext context) async {
    final currentEmail = await AuthLocal.getCurrentEmail();
    if (!context.mounted) return;

    Navigator.pushNamed(
      context,
      Routes.verifyPassword,
      arguments: {'email': currentEmail},
    );
  }
}