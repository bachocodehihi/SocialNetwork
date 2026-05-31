import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/service/notification.dart';
import 'package:socialnetwork/data/service/socket.dart';

class SignInPasswordController extends ChangeNotifier {

  final passwordController = TextEditingController();
  final String email;
  final AuthUsecase _authUsecase;

  SignInPasswordController(this._authUsecase, {required this.email});

  String _errorMessage = '';
  bool _isLoading = false;
  bool _obscurePassword = true;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get obscurePassword => _obscurePassword;

  static const _messages = {
    'INCORRECT_PASSWORD': 'Incorrect password!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  void toggleObscurePassword() {
    _obscurePassword = !_obscurePassword;
    notifyListeners();
  }

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
      // 1. Clear any old session
      try {
        await NotificationService().removeFcmToken();
      } catch (_) {}
      SocketService().disconnect();

      // 2. Perform login
      await _authUsecase.login(email: email, password: password);

      // 3. Init services for new user
      await NotificationService().init();
      await SocketService().connect();

      final targetRoute = await Routes.getDashboardRoute();

      if (!context.mounted) return; 
      Navigator.pushNamedAndRemoveUntil(
        context,
        targetRoute,
        (route) => false,
      );

    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _errorMessage = _getErrorMessage(code);
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
