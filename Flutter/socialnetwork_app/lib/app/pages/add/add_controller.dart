import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class AddController extends ChangeNotifier {

  Future<void> goToAddAddress(BuildContext context) async {
    Navigator.pushNamed(context, Routes.addAddress);
  }

  Future<void> goToAddJob(BuildContext context) async {
    Navigator.pushNamed(context, Routes.addJob);
  }

  Future<void> goToAddPhone(BuildContext context) async {
    Navigator.pushNamed(context, Routes.addPhone);
  }

  Future<void> goToAddNationality(BuildContext context) async {
    Navigator.pushNamed(context, Routes.addNationality);
  }

}