import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/app/pages/setting/account/delete/account/account_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class DeleteAccountView extends StatefulWidget {
  const DeleteAccountView({super.key});
  @override
  State<DeleteAccountView> createState() => _DeleteAccountViewState();
}

class _DeleteAccountViewState extends State<DeleteAccountView> {
  late DeleteAccountController controller;

  @override
  void initState() {
    super.initState();
    controller = DeleteAccountController();
    controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
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
                  //   Language.of(context, 'reason_delete_account'),
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
                Language.of(context, 'enter_your_reason'),
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),

              SizedBox(height: 40.h),

              TextFormField(
                controller: controller.reasonController,
                style: TextStyle(
                  fontSize: 15.sp,
                  color: cs.onSurface,
                ),
                decoration: InputDecoration(
                  labelText: Language.of(context, 'reason'),
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
                  labelStyle: TextStyle(
                    color: Colors.grey,
                    fontSize: 15.sp,
                  ),
                  floatingLabelStyle: WidgetStateTextStyle.resolveWith(
                    (states) {
                      if (states.contains(WidgetState.focused)) {
                        return TextStyle(
                          color: Colors.blue,
                          fontSize: 15.sp,
                        );
                      }
                      return TextStyle(
                        color: Colors.grey,
                        fontSize: 15.sp,
                      );
                    },
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
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.black,
                  minimumSize: Size(double.infinity, 48.h),
                  // shape: RoundedRectangleBorder(
                  //   borderRadius: BorderRadius.circular(30.r),
                  // ),
                  shape: const StadiumBorder(),
                ).copyWith(
                  overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                ),
                onPressed: controller.isLoading
                    ? null
                    : () => controller.submitDeleteAccount(context),
                child: controller.isLoading
                    ? SizedBox(
                        width: 20.w,
                        height: 20.h,
                        child: const CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        Language.of(context, 'continue'),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15.sp,
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
