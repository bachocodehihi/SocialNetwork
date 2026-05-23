import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class QRCodeController extends ChangeNotifier {

  Map<String, dynamic>? user;

  QRCodeController() {
    loadUser();
  }

  Future<void> loadUser() async {
    user = await AuthLocal.getCurrentUser();
    notifyListeners();
  }
  
  String? get username => user?['username'];
  String? get qrCode => user?['qrCode'];

}