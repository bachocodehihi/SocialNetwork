import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/service/notification.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:socialnetwork/data/config/config.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class SignUpEmailController extends ChangeNotifier {
  
  final AuthUsecase _authUsecase;
  SignUpEmailController(this._authUsecase);

  final emailController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';
  bool isAgreedTerms = false;
  bool isAgreedSocial = false;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  void toggleAgreedTerms() {
    isAgreedTerms = !isAgreedTerms;
    if (isAgreedTerms && isAgreedSocial) {
      _errorMessage = '';
    }
    notifyListeners();
  }

  void toggleAgreedSocial() {
    isAgreedSocial = !isAgreedSocial;
    if (isAgreedTerms && isAgreedSocial) {
      _errorMessage = '';
    }
    notifyListeners();
  }

  static const _messages = {
    'SERVER_ERROR': 'server_error_please_try_again',
    'EMAIL_REGISTERED': 'email_already_exists',
    'INVALID_GOOGLE_TOKEN': 'google_authentication_failed',
  };

  String _getErrorMessage(BuildContext context, String code) {
    final key = _messages[code] ?? code;
    return Language.of(context, key);
  }

  bool validateEmail(BuildContext context) {
    final email = emailController.text.trim();

    if (email.isEmpty) {
      _errorMessage = Language.of(context, 'please_enter_email');
      notifyListeners();
      return false;
    }

    if (!RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      _errorMessage = Language.of(context, 'invalid_email');
      notifyListeners();
      return false;
    }

    if (!isAgreedTerms || !isAgreedSocial) {
      _errorMessage = Language.of(context, 'please_agree_to_terms_to_continue');
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitEmail(BuildContext context) async {
    if (!validateEmail(context)) return;

    final email = emailController.text.trim();
    _isLoading = true;
    notifyListeners();

    try {

      final emailExists = await _authUsecase.checkEmail(email);
      if (emailExists) {
        _errorMessage = _getErrorMessage(context, 'EMAIL_REGISTERED');
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
      _errorMessage = _getErrorMessage(context, code);
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
        _errorMessage = Language.of(context, 'could_not_get_id_token_from_google');
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
      _errorMessage = _getErrorMessage(context, code);
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

  Future<void> goToSignInEmail(BuildContext context) async {
    Navigator.pushReplacementNamed(context, Routes.signinEmail);
  }

  Future<void> goToTermTerm(BuildContext context) async {
    Navigator.pushNamed(context, Routes.termTerm);
  }

  Future<void> goToTermSocial(BuildContext context) async {
    Navigator.pushNamed(context, Routes.termSocial);
  }

}