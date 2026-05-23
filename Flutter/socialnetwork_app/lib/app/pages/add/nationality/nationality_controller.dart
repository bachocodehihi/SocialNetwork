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
// 1 cái app nhắn tin 
// const mongoose = require('mongoose');
 
// const accountSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     username: { type: String, required: true },
//     password: { type: String, required: true },
//     dob: { type: Date, required: true },
//     gender: { type: String, required: true },
//     avatar: { type: String, default: process.env.DEFAULT_AVATAR_URL },
//     qrCode: { type: String },
//     isVerified: { type: Boolean, default: false },
//     address: { type: String, default: "" },
//     phone: { type: String, default: "" },
//     job: { type: String, default: "" },
//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
//     followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
//     following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
//     lastSeen: { type: Date, default: Date.now },
//     fcmToken: { type: String, default: null },
// }, { timestamps: true });
 
// const Account = mongoose.model('Account', accountSchema);
// module.exports = Account;

// như thế này á
// thì chừ làm sao kiểu như là chừ tôi muốn đăng ký bằng thì làm sao vì cái này là gì có dob, hay cái gì thì mấy cái đó để trống à
// còn mật khẩu thì sao mà làm như thế rồi thì nó có biết để đăng nhập bằng cái google kia không lần sau đăng nhập thì họ bấm vào đó là biết tự đăng nhập không cần mật khẩu á

