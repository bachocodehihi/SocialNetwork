import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';

class SettingPrivacyController extends ChangeNotifier {
  final AccountUsecase _accountUsecase;

  SettingPrivacyController(this._accountUsecase);

  bool _isLoading = true;
  String _errorMessage = '';

  bool _emailOn = true;
  bool _phoneOn = true;
  bool _jobOn = true;
  bool _addressOn = true;
  bool _nationalityOn = true;
  bool _birthdayOn = true;
  bool _genderOn = true;

  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;

  bool get emailOn => _emailOn;
  bool get phoneOn => _phoneOn;
  bool get jobOn => _jobOn;
  bool get addressOn => _addressOn;
  bool get nationalityOn => _nationalityOn;
  bool get birthdayOn => _birthdayOn;
  bool get genderOn => _genderOn;

  Future<void> loadPrivacySettings() async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final privacy = await _accountUsecase.getPrivacy();
      _emailOn = privacy['email'] ?? true;
      _phoneOn = privacy['phone'] ?? true;
      _addressOn = privacy['address'] ?? true;
      _birthdayOn = privacy['birthday'] ?? true;
      _genderOn = privacy['gender'] ?? true;
      _jobOn = privacy['job'] ?? true;
      _nationalityOn = privacy['nationality'] ?? true;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updatePrivacySetting(String key, bool value) async {
    bool oldValue = true;
    switch (key) {
      case 'email':
        oldValue = _emailOn;
        _emailOn = value;
        break;
      case 'phone':
        oldValue = _phoneOn;
        _phoneOn = value;
        break;
      case 'address':
        oldValue = _addressOn;
        _addressOn = value;
        break;
      case 'birthday':
        oldValue = _birthdayOn;
        _birthdayOn = value;
        break;
      case 'gender':
        oldValue = _genderOn;
        _genderOn = value;
        break;
      case 'job':
        oldValue = _jobOn;
        _jobOn = value;
        break;
      case 'nationality':
        oldValue = _nationalityOn;
        _nationalityOn = value;
        break;
    }
    
    notifyListeners();

    try {
      final updated = await _accountUsecase.updatePrivacy({key: value});
      _emailOn = updated['email'] ?? true;
      _phoneOn = updated['phone'] ?? true;
      _addressOn = updated['address'] ?? true;
      _birthdayOn = updated['birthday'] ?? true;
      _genderOn = updated['gender'] ?? true;
      _jobOn = updated['job'] ?? true;
      _nationalityOn = updated['nationality'] ?? true;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      switch (key) {
        case 'email':
          _emailOn = oldValue;
          break;
        case 'phone':
          _phoneOn = oldValue;
          break;
        case 'address':
          _addressOn = oldValue;
          break;
        case 'birthday':
          _birthdayOn = oldValue;
          break;
        case 'gender':
          _genderOn = oldValue;
          break;
        case 'job':
          _jobOn = oldValue;
          break;
        case 'nationality':
          _nationalityOn = oldValue;
          break;
      }
      notifyListeners();
    }
  }
}
