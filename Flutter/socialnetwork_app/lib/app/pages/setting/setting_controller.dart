import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/app/widgets/bottomsheet/switch_account.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/service/socket.dart';

class SettingController extends ChangeNotifier {
  final _accountApi = AccountApi(DioClient.createDio());

  Future<void> goToAccount(BuildContext context)async {
    Navigator.pushNamed(context, Routes.account);
  }

  Future<void> goToDarkmode(BuildContext context) async {
    Navigator.pushNamed(context, Routes.darkmode);
  }

  Future<void> goToLanguage(BuildContext context) async {
    Navigator.pushNamed(context, Routes.language);
  }

  Future<void> goToActivity(BuildContext context) async {
    Navigator.pushNamed(context, Routes.activity);
  }

  Future<void> goToFont(BuildContext context) async {
    Navigator.pushNamed(context, Routes.font);
  }

  Future<void> logout(BuildContext context) async {
    // 1. Remove FCM token from server
    await _accountApi.removeFcmToken();

    // 2. Disconnect socket
    SocketService().disconnect();

    // 3. Clear local data
    await AuthLocal.logout();

    if (!context.mounted) return;
    Navigator.pushNamedAndRemoveUntil(
      context,
      Routes.wellcome,
      (route) => false,
    );
  }

  Future<void> switchAccount(BuildContext context) async {
    final accounts = await AuthLocal.getSavedAccounts();
    final currentEmail = await AuthLocal.getCurrentEmail();
    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => SwitchAccountBottomSheet(
        accounts: accounts,
        currentEmail: currentEmail,
        onSelectEmail: (email) async {
          if (!context.mounted) return;
          Navigator.pushNamed(
            context,
            Routes.switchAccount,
            arguments: {'email': email},
          );
        },
        onAddAccount: () {
          Navigator.pushNamed(context, Routes.signinEmail);
        },
      ),
    );
  }
}