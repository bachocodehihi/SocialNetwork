import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

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
          backgroundColor: cs.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.r),
          ),
          title: Text(
            'Xóa tài khoản',
            style: TextStyle(
              fontSize: 15.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface,
            ),
          ),
          content: Text(
            'Bạn có chắc chắn muốn lên lịch xóa tài khoản này không? Tài khoản sẽ được lên lịch xóa vĩnh viễn sau 24 giờ.',
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
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey,
                        foregroundColor: Colors.white,
                        minimumSize: Size(double.infinity, 48.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                      onPressed: () => Navigator.of(dialogContext).pop(false),
                      child: Text(
                        'Hủy',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15.sp,
                        ),
                      ),
                    ),
                  ),
                ),

                SizedBox(width: 10.w),

                Expanded(
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        minimumSize: Size(double.infinity, 48.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                      onPressed: () => Navigator.of(dialogContext).pop(true),
                      child: Text(
                        'Xác nhận',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15.sp,
                        ),
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