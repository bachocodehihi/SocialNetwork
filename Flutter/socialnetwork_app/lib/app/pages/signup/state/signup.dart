import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/signup/model/signup_data.dart';
class SignUpProvider extends ChangeNotifier {
  final SignupData data = SignupData();

  void setEmail(String value) {
    data.email = value;
    print("Set Email: $value");
    notifyListeners();
  }

  void setName(String value) {
    data.name = value;
    print("Set Name: $value");
    notifyListeners();
  }

  void setBirthday(String value) {
    data.birthday = value;
    print("Set Birthday: $value");
    notifyListeners();
  }

  void setGender(String value) {
    data.gender = value;
    print("Set Gender: $value");
    notifyListeners();
  }

  void setAvatar(String value) {
    data.avatar = value;
    print("Set Avatar: $value");
    notifyListeners();
  }

  void setPassword(String value) {
    data.password = value;
    print("Set Password: $value");
    notifyListeners();
  }

  bool get isReadyToSubmit =>
      data.email != null &&
      data.name != null &&
      data.birthday != null &&
      data.gender != null &&
      data.avatar != null &&
      data.password != null;

  void clear() {
    data.email = null;
    data.name = null;
    data.birthday = null;
    data.gender = null;
    data.avatar = null;
    data.password = null;
    notifyListeners();
  }
}