import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class SettingAccountController extends ChangeNotifier {
  void goToChange(BuildContext context) {
    Navigator.pushNamed(context, Routes.change);
  }

  void goToDelete(BuildContext context) {
    Navigator.pushNamed(context, Routes.delete);
  }

}