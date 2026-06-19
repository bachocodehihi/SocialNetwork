import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
class VerifyPasswordController extends ChangeNotifier {
  
  final passwordController = TextEditingController();
  final String email;
  final AuthUsecase _authUsecase;
  VerifyPasswordController(this._authUsecase, {required this.email});

  bool _isLoading = false;
  String _errorMessage = '';
  bool _obscurePassword = true;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get obscurePassword => _obscurePassword;

  void toggleObscurePassword() {
    _obscurePassword = !_obscurePassword;
    notifyListeners();
  }

  static const _messages = {
    'INCORRECT_PASSWORD': 'Incorrect password!',
    'SERVER_ERROR': 'Server error, please try again!',
  };
  
  bool validatePassword() {
    final password = passwordController.text.trim();

    if (password.isEmpty) {
      _errorMessage = 'Please enter password!';
      notifyListeners();
      return false;
    }
    if (password.length < 8) {
      _errorMessage = 'Password must be at least 8 characters!';
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

    try {
      await _authUsecase.login(email: email, password: password, isVerifying: true);

      if (!context.mounted) return; 

      final accountApi = AccountApi(DioClient.createDio());
      final response = await accountApi.getProfile();
      bool isDeleted = false;
      if (response.statusCode == 200 && response.data != null) {
        isDeleted = response.data['isDeleted'] == true;
      }

      if (!context.mounted) return;

      if (isDeleted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routes.warming,
          (route) => route.settings.name == Routes.delete,
        );
      } else {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routes.deleteAccount,
          (route) => route.settings.name == Routes.delete,
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

  void goToForget(BuildContext context) {
    Navigator.pushNamed(context, Routes.forgot);
  }

  @override
  void dispose() {
    passwordController.dispose();
    super.dispose();
  }

}
