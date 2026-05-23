import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class WellcomeController extends ChangeNotifier {
  void goToSignInEmail(BuildContext context) {
    Navigator.pushNamed(context, Routes.signinEmail);
  }
  void goToSignUpEmail(BuildContext context) {
    Navigator.pushNamed(context, Routes.signupEmail);
  }
}

