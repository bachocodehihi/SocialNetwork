import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/service/notification.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:socialnetwork/data/config/config.dart';

class SignInEmailController extends ChangeNotifier {

  final emailController = TextEditingController();

  final AuthUsecase _authUsecase;

  SignInEmailController(this._authUsecase);

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  static const _messages = {
    'SERVER_ERROR': 'Server error, please try again!',
    'EMAIL_NOT_EXIST': ' Email does not exist!',
    'INVALID_GOOGLE_TOKEN': 'Google authentication failed!',
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
      if (!emailExists) {
        _errorMessage = _messages['EMAIL_NOT_EXIST']!;
        return;
      }
      if (context.mounted) {
        Navigator.pushNamed(
          context,
          Routes.signinPassword,
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

  Future<void> handleGoogleSignIn(BuildContext context) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        serverClientId: Config.googleServerClientId,
      );
      
      try {
        await googleSignIn.signOut();
      } catch (_) {}
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();

      if (googleUser == null) {
        _isLoading = false;
        notifyListeners();
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        _errorMessage = 'Could not get ID Token from Google';
        _isLoading = false;
        notifyListeners();
        return;
      }

      try {
        await NotificationService().removeFcmToken();
      } catch (_) {}
      SocketService().disconnect();

      await _authUsecase.googleLogin(idToken);

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

  void goToSignUpEmail(BuildContext context) {
    Navigator.pushReplacementNamed(context, Routes.signupEmail);
  }

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }
}
