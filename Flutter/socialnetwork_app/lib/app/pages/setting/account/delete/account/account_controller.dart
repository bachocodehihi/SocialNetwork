import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class DeleteAccountController extends ChangeNotifier {
  final reasonController = TextEditingController();
  final _accountApi = AccountApi(DioClient.createDio());

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  void setErrorMessage(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  bool validateReason() {
    final reason = reasonController.text.trim();
    if (reason.isEmpty) {
      _errorMessage = 'Vui lòng nhập lý do xóa tài khoản!';
      notifyListeners();
      return false;
    }
    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitDeleteAccount(BuildContext context) async {
    if (!validateReason()) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) {
        final cs = Theme.of(dialogContext).colorScheme;
        return AlertDialog(
          backgroundColor: cs.surfaceContainerHigh,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.r),
          ),
          title: Text(
            Language.of(context, 'delete_account'),
            style: TextStyle(
              fontSize: 15.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface,
            ),
          ),
          content: Text(
            Language.of(context, 'are_you_sure_you_want_to_schedule_the_deletion_of_this_account_The_account_will_be_permanently_deleted_in_24_hours'),
            textAlign: TextAlign.justify,
            style: TextStyle(
              fontSize: 15.sp,
              color: cs.onSurface,
            ),
          ),
          actions: [
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey,
                      foregroundColor: Colors.white,
                      minimumSize: Size(double.infinity, 48.h),
                      // shape: RoundedRectangleBorder(
                      //   borderRadius: BorderRadius.circular(30.r),
                      // ),
                      shape: const StadiumBorder(),
                    ).copyWith(
                      overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                    ),
                    onPressed: () => Navigator.of(dialogContext).pop(false),
                    child: Text(
                      Language.of(context, 'cancel'),
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15.sp,
                      ),
                    ),
                  ),
                ),

                SizedBox(width: 10.w),

                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      minimumSize: Size(double.infinity, 48.h),
                      // shape: RoundedRectangleBorder(
                      //   borderRadius: BorderRadius.circular(30.r),
                      // ),
                      shape: const StadiumBorder(),
                    ).copyWith(
                      overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                    ),
                    onPressed: () => Navigator.of(dialogContext).pop(true),
                    child: Text(
                      Language.of(context, 'confirm'),
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15.sp,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (confirm != true) return;

    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {

      await _accountApi.requestDeleteAccount();

      if (!context.mounted) return;

      Navigator.pushNamed(
        context,
        Routes.warming,
      );
    } catch (e) {
      _errorMessage = 'Đã xảy ra lỗi khi yêu cầu xóa, vui lòng thử lại!';
      notifyListeners();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    reasonController.dispose();
    super.dispose();
  }
}