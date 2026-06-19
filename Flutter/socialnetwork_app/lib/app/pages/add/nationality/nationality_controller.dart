import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/app/widgets/dialog/alert.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class AddNationalityController extends ChangeNotifier {
  final AccountUsecase _accountUsecase;

  AddNationalityController(this._accountUsecase);

  final nationalityController = TextEditingController();

  String _selectedCountryCode = '';
  String _selectedCountryName = '';
  
  String get selectedCountryCode => _selectedCountryCode;
  String get selectedCountryName => _selectedCountryName;

  void selectCountry({required String code, required String name}) {
    _selectedCountryCode = code;
    _selectedCountryName = name;
    nationalityController.text = name;
    
    _errorMessage = '';
    notifyListeners();
  }

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  static const _messages = {
    'NATIONALITY_ADD_SUCCESS': 'Add nationality successfully!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  bool validateNationality() {

    if (_selectedCountryCode.isEmpty) {
      _errorMessage = 'Please select nationality!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> addNationality(BuildContext context) async {
    if (!validateNationality()) return;

    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      await _accountUsecase.addNationality(_selectedCountryName);
      final user = await AuthLocal.getCurrentUser();
      if (user != null) {
        user['nationality'] = _selectedCountryName;
        await AuthLocal.saveUser(user);
      }
      if (context.mounted) {
        await showDialog(
          context: context,
          barrierDismissible: true,
          builder: (_) => AppAlertDialog(
            icon: Icons.check_outlined,
            iconColor: Colors.green,
            message: _messages['NATIONALITY_ADD_SUCCESS']!,
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
    nationalityController.dispose();
    super.dispose();
  }

}


