import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class MainUserController extends ChangeNotifier {
  final int initialIndex;
  final _accountApi = AccountApi(DioClient.createDio());

  bool isDeleted = false;
  DateTime? deleteAt;
  late int currentIndex;

  MainUserController({this.initialIndex = 0}) {
    currentIndex = initialIndex;
    checkDeletionStatus();
  }

  void changeTab(int index) {
    if (currentIndex == index) return;
    currentIndex = index;
    notifyListeners();
  }

  Future<void> checkDeletionStatus() async {
    try {
      final response = await _accountApi.getProfile();
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        isDeleted = data['isDeleted'] == true;
        if (data['deleteAt'] != null) {
          deleteAt = DateTime.parse(data['deleteAt'].toString()).toLocal();
        }
        notifyListeners();
      }
    } catch (_) {
      final user = await AuthLocal.getCurrentUser();
      if (user != null) {
        isDeleted = user['isDeleted'] == true;
        if (user['deleteAt'] != null) {
          deleteAt = DateTime.parse(user['deleteAt'].toString()).toLocal();
        }
        notifyListeners();
      }
    }
  }

  Future<void> cancelDeletion(BuildContext context) async {
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
            'Hủy xóa tài khoản',
            style: TextStyle(
              fontSize: 15.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface,
            ),
          ),
          content: Text(
            'Bạn có chắc chắn muốn hủy yêu cầu xóa tài khoản này không? Tài khoản của bạn sẽ trở lại trạng thái hoạt động bình thường.',
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

                SizedBox(width: 10.w),

                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
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
              ],
            ),
          ],
        );
      },
    );

    if (confirm != true) return;

    try {
      final response = await _accountApi.cancelDeleteAccount();
      if (response.statusCode == 200) {
        isDeleted = false;
        deleteAt = null;
        notifyListeners();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Không thể hủy yêu cầu xóa tài khoản, vui lòng thử lại!'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}