import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/verify/password/password_controller.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/repositories/auth_repository_imp.dart';
import 'package:socialnetwork/data/network/api/auth_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class VerifyPasswordView extends StatefulWidget {
  const VerifyPasswordView({super.key});

  @override
  State<VerifyPasswordView> createState() => _VerifyPasswordViewState();
}

class _VerifyPasswordViewState extends State<VerifyPasswordView> {
  
  late VerifyPasswordController controller;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final email = args?['email'] as String? ?? '';
    controller = VerifyPasswordController(
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
      body: SafeArea(
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
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.arrow_back_ios_outlined,
                      size: 20.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Text(
                    Language.of(context, 'verify_password'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),

              SizedBox(height: 20.h),

              TextFormField(
                controller: controller.passwordController,
                obscureText: controller.obscurePassword,
                style: TextStyle(
                  fontSize: 15.sp,
                  color: cs.onSurface,
                ),
                decoration: InputDecoration(
                  labelText: Language.of(context, 'password'),
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
                  suffixIcon: GestureDetector(
                    onTap: controller.toggleObscurePassword,
                    child: Icon(
                      controller.obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: Colors.grey,
                    ),
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

              ElevatedButton(
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
                    : () => controller.submitPassword(context),
                child: controller.isLoading ? const CircularProgressIndicator(color: Colors.white) : Text(
                  Language.of(context, 'continue'),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),

              const Spacer(),

              GestureDetector(
                onTap: () {
                  controller.goToForget(context);
                },
                child: Text(
                  Language.of(context, 'forgot_password'),
                  style: TextStyle(
                    color: Colors.blue,
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),

            ],
          ),
        ),
      ),
    );
  }

}
