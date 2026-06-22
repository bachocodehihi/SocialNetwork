import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/app/widgets/dialog/alert.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
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
    'FORGOT_PASSWORD_SUCCESS': 'forgot_password_success',
    'SERVER_ERROR': 'server_error_please_try_again',
  };

  String _getErrorMessage(BuildContext context, String code) {
    final key = _messages[code] ?? code;
    return Language.of(context, key);
  }

  bool validatePassword(BuildContext context) {
    final newPassword = newPasswordController.text.trim();

    final newConfirmPassword = newConfirmPasswordController.text.trim();

    if (newPassword.isEmpty) {
      _errorMessage = Language.of(context, 'please_enter_password');
      notifyListeners();
      return false;
    }

    if (newConfirmPassword.isEmpty) {
      _errorMessage = Language.of(context, 'please_enter_confirm_password');
      notifyListeners();
      return false;
    }

    if (newPassword.length < 8) {
      _errorMessage = Language.of(context, 'password_must_be_at_least_8_characters');
      notifyListeners();
      return false;
    }

    final passwordRegex = RegExp(
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$',
    );

    if (!passwordRegex.hasMatch(newPassword)) {
      _errorMessage = Language.of(context, 'password_must_include_requirements');
      notifyListeners();
      return false;
    }

    if (newPassword != newConfirmPassword) {
      _errorMessage = Language.of(context, 'passwords_do_not_match');
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> forgotPassword(BuildContext context) async {

    if (!validatePassword(context)) return;

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
            message: _getErrorMessage(context, 'FORGOT_PASSWORD_SUCCESS'),
          ),
        ).then((_) {
          if (context.mounted) {
            Navigator.popUntil(
              context,
              (route) => route.settings.name == Routes.forgot,
            );
          }
        });
      }
    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _errorMessage = _getErrorMessage(context, code);
      notifyListeners();
      if (context.mounted) {
        showDialog(
          context: context,
          barrierDismissible: true,
          builder: (_) => AppAlertDialog(
            icon: Icons.close_outlined,
            iconColor: Colors.red,
            message: _getErrorMessage(context, code),
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
