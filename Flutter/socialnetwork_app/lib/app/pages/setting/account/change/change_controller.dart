import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class SettingChangeController extends ChangeNotifier {

  Future<void> goToChange(BuildContext context) async {
    Navigator.pushNamed(context, Routes.activity);
  }

  Future<void> goToChangeName(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeName);
  }

  Future<void> goToChangeEmail(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeEmail);
  }

  Future<void> goToChangeGender(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeGender);
  }

  Future<void> goToChangeBirthday(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeBirthday);
  }

  Future<void> goToChangeJob(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeJob);
  }

  Future<void> goToChangeAvatar(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeAvatar);
  }

  Future<void> goToChangeAddress(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeAddress);
  }

  Future<void> goToChangePhone(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changePhone);
  }

  Future<void> goToChangeNationality(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changeNationality);
  }

  Future<void> goToChangePassword(BuildContext context) async {
    Navigator.pushNamed(context, Routes.changePassword);
  }

}