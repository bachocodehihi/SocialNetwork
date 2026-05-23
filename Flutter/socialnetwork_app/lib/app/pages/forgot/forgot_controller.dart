import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';

class ForgotController extends ChangeNotifier {

  final AuthUsecase _authUsecase;
  ForgotController(this._authUsecase);

  final emailController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  static const _messages = {
    'SERVER_ERROR': 'Server error, please try again!',
    'EMAIL_NOT_EXIST': ' Email does not exist!',
  };

  bool validateEmail() {
    final email = emailController.text.trim();

    if (email.isEmpty) {
      _errorMessage = 'Please enter email!';
      notifyListeners();
      return false;
    }

    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(email)) {
      _errorMessage = 'Invalid email format!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitEmail(BuildContext context) async {
    if (!validateEmail()) return;

    final email = emailController.text.trim();
    _isLoading = true;
    notifyListeners();

    try {

      final emailExists = await _authUsecase.checkEmail(email);
      if (!emailExists) {
        _errorMessage = _messages['EMAIL_NOT_EXIST']!;
        return;
      }
      await _authUsecase.sendOtp(email);
      if (context.mounted) {
        Navigator.pushNamed(
          context,
          Routes.verifyForgot,
          arguments: {'email': email},
        );
      }
    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _errorMessage = _messages[code] ?? code;
      notifyListeners();
    } finally {
      _isLoading = false;
      notifyListeners();
    }

  }

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }

}
