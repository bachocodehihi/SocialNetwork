import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:socialnetwork/app/pages/wellcome/wellcome_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class WellcomeView extends StatefulWidget {
  const WellcomeView({super.key});
  @override
  State<WellcomeView> createState() => _WellcomeViewState();
}
class _WellcomeViewState extends State<WellcomeView> {
  final controller = WellcomeController();
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Spacer(),
              Column(
                children: [
                  Text(
                    Language.of(context, 'hello'),
                    style: TextStyle(
                      color: Colors.blue,
                      fontSize: 25.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Text(
                    Language.of(context, 'welcome_to_social_network_app'),
                    style: TextStyle(
                      color: Colors.blue,
                      fontSize: 15.sp,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Column(
                children: [
                  MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        minimumSize: Size(double.infinity, 48.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                      onPressed: () {
                        controller.goToSignInEmail(context);
                      },
                      child: Text(
                        Language.of(context, 'sign_in'),
                        style: TextStyle(
                          color: Colors.white, 
                          fontSize: 15.sp,
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 15.h),
                  
                  MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey,
                        minimumSize: Size(double.infinity, 48.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                      onPressed: () {
                        controller.goToSignUpEmail(context);
                      },
                      child: Text(
                        Language.of(context, 'create_new_account'),
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
          ),
        ),
      ),
    );
  }
}