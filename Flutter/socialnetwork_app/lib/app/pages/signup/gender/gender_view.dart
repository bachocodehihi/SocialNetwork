import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/signup/gender/gender_controller.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/app/widgets/dialog/gender.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class SignUpGenderView extends StatefulWidget {
  const SignUpGenderView({super.key});
  @override
  State<SignUpGenderView> createState() => _SignUpGenderViewState();
}

class _SignUpGenderViewState extends State<SignUpGenderView> {

  late SignUpGenderController controller;
  
  @override
  void initState() {
    super.initState();
    controller = SignUpGenderController();
    controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void _openGenderDialog() {
    showDialog(
      context: context,
      builder: (_) => GenderDialog(
        initialGender: controller.genderController.text.isEmpty
            ? null
            : controller.genderController.text,
        onConfirm: (gender) {
          controller.genderController.text = gender;
        },
      ),
    );
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
                      onTap: () => Navigator.pop(context),
                      child: Icon(
                        Icons.arrow_back_ios_outlined,
                        size: 20.sp,
                        color: cs.onSurface,
                      ),
                    ),
                    // SizedBox(width: 10.w),
                    // Text(
                    //   Language.of(context, 'select_gender'),
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
                  Language.of(context, 'select_your_gender'),
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),
                SizedBox(height: 40.h),
                TextFormField(
                  controller: controller.genderController,
                  style: TextStyle(fontSize: 15.sp, color: cs.onSurface),
                  readOnly: true,
                  onTap: _openGenderDialog,
                  decoration: InputDecoration(
                    labelText: Language.of(context, 'gender'),
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
                    : () => controller.submitGender(context),
                  child: controller.isLoading
                    ? const CircularProgressIndicator(
                      color: Colors.white
                    ) : Text(
                        Language.of(context, 'continue'),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15.sp,
                        ),
                      ),
                ),
                Column(
                  children: [
                    Text(
                      '',
                      style: TextStyle(
                        fontSize: 15.sp,
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
    );
  }
}