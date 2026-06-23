import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class SignUpGenderController extends ChangeNotifier {
  final genderController = TextEditingController();

  String _errorMessage = '';
  bool _isLoading = false;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  bool validateGender(BuildContext context) {
    final genderText = genderController.text.trim();

    if (genderText.isEmpty) {
      _errorMessage = Language.of(context, 'please_select_gender');
      notifyListeners();
      return false;
    }
    
    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitGender(BuildContext context) async {
    if (!validateGender(context)) return;
    
    final genderText = genderController.text.trim();
    String dbGender = 'Other';
    if (genderText == Language.of(context, 'male')) {
      dbGender = 'Male';
    } else if (genderText == Language.of(context, 'female')) {
      dbGender = 'Female';
    }

    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    context.read<SignUpProvider>().setGender(dbGender);
    if (context.mounted) {
      Navigator.pushNamed(context, Routes.signupAvatar);
      _isLoading = false; 
      notifyListeners();
    }
  }

  @override
  void dispose() {
    genderController.dispose();
    super.dispose();
  }
}
