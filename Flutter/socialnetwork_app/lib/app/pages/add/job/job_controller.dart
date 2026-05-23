import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/app/widgets/dialog/alert.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class AddJobController extends ChangeNotifier {
  final AccountUsecase _accountUsecase;

  AddJobController(this._accountUsecase);

  final jobController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  static const _messages = {
    'JOB_ADD_SUCCESS': 'Add job successfully!',
    'SERVER_ERROR': 'Server error, please try again!',
  };

  String _getErrorMessage(String code) {
    return _messages[code] ?? code;
  }

  bool validateJob() {
    final job = jobController.text.trim();

    if (job.isEmpty) {
      _errorMessage = 'Please enter job!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> addJob(BuildContext context) async {
    if (!validateJob()) return;

    final job = jobController.text.trim();

    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      await _accountUsecase.addJob(job);
      final user = await AuthLocal.getCurrentUser();
      if (user != null) {
        user['job'] = job;
        await AuthLocal.saveUser(user);
      }
      if (context.mounted) {
        showDialog(
          context: context,
          barrierDismissible: true,
          builder: (_) => AppAlertDialog(
            icon: Icons.check_outlined,
            iconColor: Colors.green,
            message: _messages['JOB_ADD_SUCCESS']!,
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
    jobController.dispose();
    super.dispose();
  }

}
