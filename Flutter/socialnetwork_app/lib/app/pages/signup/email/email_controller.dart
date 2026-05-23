import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class SignUpEmailController extends ChangeNotifier {
  
  final AuthUsecase _authUsecase;
  SignUpEmailController(this._authUsecase);

  final emailController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  static const _messages = {
    'SERVER_ERROR': 'Server error, please try again!',
    'EMAIL_REGISTERED': 'Email already exists!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  bool validateEmail() {
    final email = emailController.text.trim();

    if (email.isEmpty) {
      _errorMessage = 'Please enter email!';
      notifyListeners();
      return false;
    }

    if (!RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      _errorMessage = 'Invalid email!';
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
      if (emailExists) {
        _errorMessage = _messages['EMAIL_REGISTERED']!;
        return;
      }

      await _authUsecase.sendOtp(email);
      if (context.mounted) {
        
        Navigator.pushNamed(
          context,
          Routes.verifySignUp,
          arguments: {'email': email},
        );
      }
    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _errorMessage = _getErrorMessage(code);
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

  void goToSignInEmail(BuildContext context) {
    Navigator.pushReplacementNamed(context, Routes.signinEmail);
  }

}