import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/app/widgets/dialog/alert.dart';

class SignUpPasswordController extends ChangeNotifier {

  final AuthUsecase _authUsecase;
  SignUpPasswordController(this._authUsecase);
  final passwordController = TextEditingController();

  final confirmPasswordController = TextEditingController();

  String _errorMessage = '';
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get obscurePassword => _obscurePassword;
  bool get obscureConfirmPassword => _obscureConfirmPassword;

  void togglePasswordVisibility() {
    _obscurePassword = !_obscurePassword;
    notifyListeners();
  }

  void toggleConfirmPasswordVisibility() {
    _obscureConfirmPassword = !obscureConfirmPassword;
    notifyListeners();
  }
  
  static const _messages = {
    'REGISTER_SUCCESS': 'Account created successfully!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  bool validatePassword() {
    final password = passwordController.text.trim();

    final confirmPassword = confirmPasswordController.text.trim();

    if (password.isEmpty) {
      _errorMessage = 'Please enter password!';
      notifyListeners();
      return false;
    }

    if (confirmPassword.isEmpty) {
      _errorMessage = 'Please enter confirm password!';
      notifyListeners();
      return false;
    }

    if (password.length < 8) {
      _errorMessage = 'Password must be at least 8 characters!';
      notifyListeners();
      return false;
    }

    final passwordRegex = RegExp(
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$',
    );

    if (!passwordRegex.hasMatch(password)) {
      _errorMessage =
          'Password must include uppercase, lowercase, number and special character!';
      notifyListeners();
      return false;
    }

    if (password != confirmPassword) {
      _errorMessage = 'Passwords do not match!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitPassword(BuildContext context) async {
    if (!validatePassword()) return;

    final password = passwordController.text.trim();
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    final provider = context.read<SignUpProvider>();
    provider.setPassword(password);
    String formatBirthday(String bday) {
      final parts = bday.split(' - ');
      return '${parts[2]}-${parts[1]}-${parts[0]}';
    }
    try {
      await _authUsecase.register(
        email: provider.data.email!,
        username: provider.data.name!,
        password: provider.data.password!,
        birthday: formatBirthday(provider.data.birthday!),
        gender: provider.data.gender!,
        avatar: provider.data.avatar,
      );
      if (context.mounted) {
        provider.clear();
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
              Routes.wellcome,
              (route) => false,
            );
          }
        });
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
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

}
