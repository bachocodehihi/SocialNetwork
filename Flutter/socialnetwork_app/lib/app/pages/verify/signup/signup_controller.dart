import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';

class VerifySignUpController extends ChangeNotifier {

  final AuthUsecase _authUsecase;
  VerifySignUpController(this._authUsecase);

  bool isLoading = false;
  bool isResending = false;
  String errorMessage = '';

  static const _messages = {
    'OTP_VERIFIED': 'OTP verified successfully!',
    'OTP_INVALID': 'Invalid OTP code!',
    'OTP_EXPIRED': 'OTP has expired, please request a new one!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  void _setLoading(bool value) {
    isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    errorMessage = message;
    notifyListeners();
  }

  void clearError() {
    _setError('');
  }

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  Future<bool> verifyOtp(String email, String otp) async {
    
    if (otp.isEmpty) {
      _setError('Please enter the OTP code!');
      return false;
    }

    if (otp.length != 6) {
      _setError('Please enter all 6 digits!');
      return false;
    }
    _setLoading(true);
    _setError('');

    try {
      await _authUsecase.verifyOtp(email, otp);
      return true;
    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _setError(_getErrorMessage(code));
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> resendOtp(String email) async {
    isResending = true;
    _setError('');
    notifyListeners();

    try {
      await _authUsecase.sendOtp(email);
      return true;
    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _setError(_getErrorMessage(code));
      return false;
    } finally {
      isResending = false;
      notifyListeners();
    }
  }

}
