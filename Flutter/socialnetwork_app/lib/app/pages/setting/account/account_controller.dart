import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class SettingAccountController extends ChangeNotifier {
  Future<void> goToChange(BuildContext context) async {
    Navigator.pushNamed(context, Routes.change);
  }

  Future<void> goToChangePassword(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changePassword);
  }

  Future<void> goToDelete(BuildContext context) async {
    Navigator.pushNamed(context, Routes.delete);
  }

}