import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/app/widgets/dialog/alert.dart';

class ForgotPasswordController extends ChangeNotifier {
  final AuthUsecase _authUsecase;
  final String email;

  ForgotPasswordController(
    this._authUsecase, 
    {required this.email}
  );

  final newPasswordController = TextEditingController();
  final newConfirmPasswordController = TextEditingController();
  
  String _errorMessage = '';
  bool _isLoading = false;
  bool _obscureNewPassword = true;
  bool _obscureNewConfirmPassword = true;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get obscureNewPassword => _obscureNewPassword;
  bool get obscureNewConfirmPassword => _obscureNewConfirmPassword;

  void toggleNewPasswordVisibility() {
    _obscureNewPassword = !_obscureNewPassword;
    notifyListeners();
  }

  void toggleNewConfirmPasswordVisibility() {
    _obscureNewConfirmPassword = !obscureNewConfirmPassword;
    notifyListeners();
  }

  static const _messages = {
    'FORGOT_PASSWORD_SUCCESS': 'Forgot password successfully!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  bool validatePassword() {
    final newPassword = newPasswordController.text.trim();

    final newConfirmPassword = newConfirmPasswordController.text.trim();

    if (newPassword.isEmpty) {
      _errorMessage = 'Please enter password!';
      notifyListeners();
      return false;
    }

    if (newConfirmPassword.isEmpty) {
      _errorMessage = 'Please enter confirm password!';
      notifyListeners();
      return false;
    }

    if (newPassword.length < 8) {
      _errorMessage = 'Password must be at least 8 characters!';
      notifyListeners();
      return false;
    }

    final passwordRegex = RegExp(
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$',
    );

    if (!passwordRegex.hasMatch(newPassword)) {
      _errorMessage =
          'Password must include uppercase, lowercase, number and special character!';
      notifyListeners();
      return false;
    }

    if (newPassword != newConfirmPassword) {
      _errorMessage = 'Passwords do not match!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> forgotPassword(BuildContext context) async {

    if (!validatePassword()) return;

    final newPassword = newPasswordController.text.trim();
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    try {
      await _authUsecase.forgotPassword(
        email: email,
        newPassword: newPassword,
      );
      if (context.mounted) {
        showDialog(
          context: context,
          barrierDismissible: true,
          builder: (_) => AppAlertDialog(
            icon: Icons.check_outlined,
            iconColor: Colors.green,
            message: 'Account created successfully!',
          ),
        ).then((_) {
          if (context.mounted) {
            Navigator.pushNamedAndRemoveUntil(
            context,
            Routes.forgot,
            (route) => false,
          );
          }
        });
      }
    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _errorMessage = _getErrorMessage(code);
      notifyListeners();
      if (context.mounted) {
        showDialog(
          context: context,
          barrierDismissible: true,
          builder: (_) => AppAlertDialog(
            icon: Icons.close_outlined,
            iconColor: Colors.red,
            message: _getErrorMessage(code),
          ),
        );
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    newPasswordController.dispose();
    newConfirmPasswordController.dispose();
    super.dispose();
  }
}
