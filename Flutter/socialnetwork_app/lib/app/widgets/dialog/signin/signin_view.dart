import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/dialog/signin/signin_controller.dart';

class SignInWebsiteDialog extends StatefulWidget {
  final String sessionId;
  final VoidCallback onCancel;
  final VoidCallback onSuccess;

  const SignInWebsiteDialog({
    super.key,
    required this.sessionId,
    required this.onCancel,
    required this.onSuccess,
  });

  @override
  State<SignInWebsiteDialog> createState() => _SignInWebsiteDialogState();
}

class _SignInWebsiteDialogState extends State<SignInWebsiteDialog> {
  late SignInWebsiteController controller;

  @override
  void initState() {
    super.initState();
    controller = SignInWebsiteController(
      sessionId: widget.sessionId,
      onCancel: widget.onCancel,
      onSuccess: widget.onSuccess,
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Dialog(
      backgroundColor: cs.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24.r),
      ),
      elevation: 8,
      child: ListenableBuilder(
        listenable: controller,
        builder: (context, _) {
          return Padding(
            padding: EdgeInsets.symmetric(
              horizontal: kIsWeb ? 0 : 24.w,
              vertical: 28.h,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 64.w,
                  height: 64.w,
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.computer_outlined,
                    size: 32.sp,
                    color: Colors.blue,
                  ),
                ),
                SizedBox(height: 20.h),
                Text(
                  'Xác nhận đăng nhập',
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),
                SizedBox(height: 12.h),
                Text(
                  'Bạn có muốn đăng nhập tài khoản của mình trên thiết bị Web này không?',
                  textAlign: TextAlign.justify,
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
                if (controller.errorMessage != null) ...[
                  SizedBox(height: 12.h),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Text(
                      controller.errorMessage!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13.sp,
                        color: Colors.red,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
                SizedBox(height: 28.h),
                Row(
                  children: [
                    // Expanded(
                    //   child: MouseRegion(
                    //     cursor: SystemMouseCursors.click,
                    //     child: OutlinedButton(
                    //       style: OutlinedButton.styleFrom(
                    //         padding: EdgeInsets.symmetric(vertical: 14.h),
                    //         shape: RoundedRectangleBorder(
                    //           borderRadius: BorderRadius.circular(30.r),
                    //         ),
                    //         side: BorderSide(color: cs.onSurface.withValues(alpha: 0.15)),
                    //       ),
                    //       onPressed: controller.isLoading
                    //           ? null
                    //           : () => controller.cancelSignIn(context),
                    //       child: Text(
                    //         'Hủy',
                    //         style: TextStyle(
                    //           fontSize: 15.sp,
                    //           color: Colors.white,
                    //         ),
                    //       ),
                    //     ),
                    //   ),
                    // ),
                    Expanded(
                      child: MouseRegion(
                        cursor: SystemMouseCursors.click,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 14.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30.r),
                            ),
                            elevation: 0,
                          ),
                          onPressed: controller.isLoading
                              ? null
                              : () => controller.cancelSignIn(context),
                          child: controller.isLoading
                              ? SizedBox(
                                  width: 18.w,
                                  height: 18.w,
                                  child: const CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(
                                  'Cancel',
                                  style: TextStyle(
                                    fontSize: 15.sp,
                                    color: Colors.white,
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
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 14.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30.r),
                            ),
                            elevation: 0,
                          ),
                          onPressed: controller.isLoading
                              ? null
                              : () => controller.submitSignIn(context),
                          child: controller.isLoading
                              ? SizedBox(
                                  width: 18.w,
                                  height: 18.w,
                                  child: const CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(
                                  'Sign in',
                                  style: TextStyle(
                                    fontSize: 15.sp,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}