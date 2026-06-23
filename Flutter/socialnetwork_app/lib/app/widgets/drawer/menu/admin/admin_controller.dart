import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/service/socket.dart';

class MenuDrawerAdminController extends ChangeNotifier {
  final _accountApi = AccountApi(DioClient.createDio());
  Map<String, dynamic>? user;

  MenuDrawerAdminController() {
    loadUser();
  }

  Future<void> loadUser() async {
    user = await AuthLocal.getCurrentUser();
    notifyListeners();
  }
  
  String get username => user?['username'] ?? '';
  String get avatar => user?['avatar'] ?? '';

  void logout(BuildContext context) async {
    try {
      await _accountApi.removeFcmToken();
    } catch (_) {}

    SocketService().disconnect();

    await AuthLocal.logout();
    if (!context.mounted) return;
    Navigator.pushNamedAndRemoveUntil(
      context,
      Routes.wellcome,
      (route) => false,
    );
  }

  Future<void> goToSetting(BuildContext context) async {
    Navigator.pushNamed(context, Routes.setting);
  }

  Future<void> goToGame(BuildContext context) async {
    Navigator.pushNamed(context, Routes.game);
  }

  @override
  void dispose() {
    user = null;
    super.dispose();
  }
}