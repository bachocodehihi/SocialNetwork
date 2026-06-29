import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/setting/privacy/privacy_controller.dart';
import 'package:socialnetwork/app/widgets/item/privacy.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/data/repositories/account_repository_imp.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class SettingPrivacyView extends StatefulWidget {
  const SettingPrivacyView({super.key});
  @override
  State<SettingPrivacyView> createState() => _SettingPrivacyViewState();
}

class _SettingPrivacyViewState extends State<SettingPrivacyView> {
  late SettingPrivacyController controller;
  

  @override
  void initState() {
    super.initState();
    controller = SettingPrivacyController(
      AccountUsecase(
        AccountRepositoryImp(
          AccountApi(DioClient.createDio()),
        ),
      ),
    );
    controller.addListener(_onControllerChanged);
    controller.loadPrivacySettings();
  }

  void _onControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    controller.removeListener(_onControllerChanged);
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: brightness == Brightness.dark ? Brightness.light : Brightness.dark,
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
            crossAxisAlignment: CrossAxisAlignment.start,
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
                  SizedBox(width: 10.w),
                  Text(
                    Language.of(context, 'privacy'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20.h),
              if (controller.isLoading)
                const Expanded(
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                )
              else
                Expanded(
                  child: ListView(
                    physics: const BouncingScrollPhysics(),
                    children: [
                      Text(
                        Language.of(context, 'personal_information'), 
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurface,
                        ),
                      ),

                      SizedBox(height: 20.h),

                      PrivacyItem(
                        value: controller.emailOn,
                        title: 'Email', 
                        icon: Icons.email_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('email', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 15.h),

                      PrivacyItem(
                        value: controller.phoneOn,
                        title: Language.of(context, 'phone'), 
                        icon: Icons.phone_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('phone', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 15.h),

                      PrivacyItem(
                        value: controller.addressOn,
                        title: Language.of(context, 'address'), 
                        icon: Icons.location_on_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('address', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 15.h),

                      PrivacyItem(
                        value: controller.birthdayOn,
                        title: Language.of(context, 'birthday'), 
                        icon: Icons.cake_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('birthday', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 15.h),

                      PrivacyItem(
                        value: controller.genderOn,
                        title: Language.of(context, 'gender'), 
                        icon: Icons.wc_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('gender', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 15.h),

                      PrivacyItem(
                        value: controller.jobOn,
                        title: Language.of(context, 'job'), 
                        icon: Icons.work_outline_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('job', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 15.h),

                      PrivacyItem(
                        value: controller.nationalityOn,
                        title: Language.of(context, 'nationality'), 
                        icon: Icons.public_outlined,
                        onChanged: (val) => controller.updatePrivacySetting('nationality', val),
                        onTap: () {},
                      ),

                      SizedBox(height: 20.h),

                      Text(
                        Language.of(context, 'private_account'), 
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurface,
                        ),
                      ),

                      SizedBox(height: 15.h),

                      // PrivacyItem(
                      //   value: controller.nationalityOn,
                      //   title: Language.of(context, 'private_account'), 
                      //   icon: Icons.public_outlined,
                      //   onChanged: () {},
                      //   onTap: () {},
                      // ),
                    ],
                  ),
                ),
            ],    
          ),
        ),
      ),
    ); 
  }
}      
