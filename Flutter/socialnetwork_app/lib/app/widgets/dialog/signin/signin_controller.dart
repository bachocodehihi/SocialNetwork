import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/auth_api.dart';
import 'package:socialnetwork/data/repositories/auth_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class SignInWebsiteController extends ChangeNotifier {
  final String sessionId;
  final VoidCallback onCancel;
  final VoidCallback onSuccess;

  SignInWebsiteController({
    required this.sessionId,
    required this.onCancel,
    required this.onSuccess,
  });

  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> submitSignIn(BuildContext context) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final token = await AuthLocal.getToken() ?? '';

      final authUsecase = AuthUsecase(
        AuthRepositoryImp(AuthApi(DioClient.createDio())),
      );

      await authUsecase.confirmQRLogin(
        sessionId: sessionId,
        token: token,
      );

      _isLoading = false;
      notifyListeners();
      
      onSuccess();
      if (context.mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }

  void cancelSignIn(BuildContext context) {
    onCancel();
    Navigator.of(context).pop();
  }
}
