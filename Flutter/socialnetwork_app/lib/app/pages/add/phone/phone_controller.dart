import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/app/widgets/dialog/alert.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class AddPhoneController extends ChangeNotifier {
  final AccountUsecase _accountUsecase;

  AddPhoneController(this._accountUsecase);

  final phoneController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  static const _messages = {
    'PHONE_ADD_SUCCESS': 'Add phone successfully!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  bool validatePhone() {
    final phone = phoneController.text.replaceAll(' ', '').trim();

    if (phone.isEmpty) {
      _errorMessage = 'Please enter phone!';
      notifyListeners();
      return false;
    }

    if (phone.length != 10) {
      _errorMessage = 'Phone must be 10 digits!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> addPhone(BuildContext context) async {
    if (!validatePhone()) return;

    final phone = phoneController.text.trim();

    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      await _accountUsecase.addPhone(phone);
      final user = await AuthLocal.getCurrentUser();
      if (user != null) {
        user['phone'] = phone;
        await AuthLocal.saveUser(user);
      }
      if (context.mounted) {
        await showDialog(
          context: context,
          barrierDismissible: true,
          builder: (_) => AppAlertDialog(
            icon: Icons.check_outlined,
            iconColor: Colors.green,
            message: _messages['PHONE_ADD_SUCCESS']!,
          ),
        );
        if (context.mounted) {
          Navigator.pop(context, true);
        }
      }

    } catch (e) {
      final code = e.toString().replaceAll('Exception: ', '');
      _errorMessage = _getErrorMessage(code);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    phoneController.dispose();
    super.dispose();
  }

}
