import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
class SignUpNameController extends ChangeNotifier {
  final TextEditingController usernameController = TextEditingController();

  String _errorMessage = '';
  bool _isLoading = false;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  bool validateUsername() {
    final username = usernameController.text.trim();

    if (username.isEmpty) {
      _errorMessage = 'Please enter username!';
      notifyListeners();
      return false;
    }

    if (username.length < 2 || username.length > 40) {
      _errorMessage = 'Username must be 2 - 40 characters!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitName(BuildContext context) async {
    if (!validateUsername()) return;
    if (!context.mounted) return;
    
    final username = usernameController.text.trim();
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    context.read<SignUpProvider>().setName(username);
    if (context.mounted) {
      Navigator.pushNamed(context, Routes.signupBirthday);
      _isLoading = false; 
      notifyListeners();
    }
  }

  @override
  void dispose() {
    usernameController.dispose();
    super.dispose();
  }
}
