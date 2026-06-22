import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/forgot/password/password_controller.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/repositories/auth_repository_imp.dart';
import 'package:socialnetwork/data/network/api/auth_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class ForgotPasswordView extends StatefulWidget {
  const ForgotPasswordView({super.key});
  @override
  State<ForgotPasswordView> createState() => _ForgotPasswordViewState();
}
class _ForgotPasswordViewState extends State<ForgotPasswordView> {

  late ForgotPasswordController controller;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final email = args?['email'] as String? ?? '';
    controller = ForgotPasswordController(
      AuthUsecase(
        AuthRepositoryImp(
          AuthApi(DioClient.createDio()),
        ),
      ),
      email: email,
    );
    controller.addListener(() => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness:
            brightness == Brightness.dark ? Brightness.light : Brightness.dark,
      ),
    );
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: cs.surface,
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(    
                horizontal: kIsWeb ? 0 : 24.w,
                vertical: 16.h,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Icon(
                          Icons.arrow_back_ios_outlined, 
                          size: 20.sp,
                          color: cs.onSurface,
                        ),
                      ),
                      // SizedBox(width: 10.w),
                      // Text(
                      //   'Enter new password',
                      //   style: TextStyle(
                      //     fontSize: 20.sp,
                      //     fontWeight: FontWeight.w500,
                      //     color: cs.onSurface,
                      //   ),
                      // ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  Text(
                    Language.of(context, 'enter_your_new_password'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(height: 40.h),

                  TextFormField(
                    obscureText: controller.obscureNewPassword,
                    controller: controller.newPasswordController,
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface,
                    ),
                    decoration: InputDecoration(
                      labelText: Language.of(context, 'new_password'),
                      labelStyle: TextStyle(fontSize: 15.sp, color: Colors.grey),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: const BorderSide(color: Colors.grey),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: const BorderSide(color: Colors.grey),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: const BorderSide(color: Colors.blue, width: 2),
                      ),
                      floatingLabelStyle: WidgetStateTextStyle.resolveWith(
                        (states) {
                          if (states.contains(WidgetState.focused)) {
                            return const TextStyle(color: Colors.blue);
                          }
                          return const TextStyle(color: Colors.grey);
                        },
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          controller.obscureNewPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: Colors.grey,
                        ),
                        onPressed: controller.toggleNewPasswordVisibility,
                      ),
                    ),
                  ),

                  SizedBox(height: 40.h),

                  TextFormField(
                    controller: controller.newConfirmPasswordController,
                    obscureText: controller.obscureNewConfirmPassword,
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface,
                    ),
                    decoration: InputDecoration(
                      labelText: Language.of(context, 'confirm_new_password'),
                      labelStyle: TextStyle(fontSize: 15.sp, color: Colors.grey),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: const BorderSide(color: Colors.grey),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: const BorderSide(color: Colors.grey),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.r),
                        borderSide: const BorderSide(color: Colors.blue, width: 2),
                      ),
                      floatingLabelStyle: WidgetStateTextStyle.resolveWith(
                        (states) {
                          if (states.contains(WidgetState.focused)) {
                            return const TextStyle(color: Colors.blue);
                          }
                          return const TextStyle(color: Colors.grey);
                        },
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          controller.obscureNewConfirmPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: Colors.grey,
                        ),
                        onPressed: controller.toggleNewConfirmPasswordVisibility,
                      ),
                    ),
                  ),

                  SizedBox(height: 20.h),

                  SizedBox(
                    height: 50.h,
                    child: Visibility(
                      visible: controller.errorMessage.isNotEmpty,
                      maintainSize: true,
                      maintainAnimation: true,
                      maintainState: true,
                      child: BannerError(message: controller.errorMessage),
                    ),
                  ),

                  SizedBox(height: 20.h),
                  
                  MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.black,
                        minimumSize: Size(double.infinity, 48.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                      onPressed: controller.isLoading
                          ? null
                          : () => controller.forgotPassword(context),
                      child: controller.isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(
                              Language.of(context, 'continue'),
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 15.sp,
                              ),
                            ),
                    ),
                  ),

                  SizedBox(height: 40.h),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '• Length: At least 8 characters',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: cs.onSurface,
                        ),
                      ),
                      SizedBox(height: 10.h),
                      Text(
                        '• Must include: Uppercase, lowercase, number & special character',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),
                ],    
              ),
            ),
          ),
        ),
      ),
    ); 
  }
}      
