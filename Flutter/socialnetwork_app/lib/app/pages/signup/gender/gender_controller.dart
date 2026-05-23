import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
class SignUpGenderController extends ChangeNotifier {
  final genderController = TextEditingController();

  String _errorMessage = '';
  bool _isLoading = false;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  bool validateGender() {
    final genderText = genderController.text.trim();

    if (genderText.isEmpty) {
      _errorMessage = 'Please select gender!';
      notifyListeners();
      return false;
    }
    
    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitGender(BuildContext context) async {
    if (!validateGender()) return;
    
    final gender = genderController.text.trim();
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    context.read<SignUpProvider>().setGender(gender);
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
