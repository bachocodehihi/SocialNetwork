import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class WellcomeController extends ChangeNotifier {
  Future<void> goToSignInEmail(BuildContext context) async {
    Navigator.pushNamed(context, Routes.signinEmail);
  }
  Future<void> goToSignUpEmail(BuildContext context) async {
    Navigator.pushNamed(context, Routes.signupEmail);
  }
}

