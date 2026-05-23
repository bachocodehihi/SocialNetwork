import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/setting/setting_controller.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class SettingView extends StatefulWidget {
  const SettingView({super.key});

  @override
  State<SettingView> createState() => _SettingViewState();
}

class _SettingViewState extends State<SettingView> {
  
  late SettingController controller;

  @override
  void initState() {
    super.initState();
    controller = SettingController();
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
              crossAxisAlignment: CrossAxisAlignment.start,
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
                      S.of(context, 'setting'),
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 20.h),

                Text(
                  S.of(context, 'interface'),
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),

                SizedBox(height: 20.h),

                SettingItem(
                  title: S.of(context, 'dark_mode'),
                  icon: Icons.dark_mode_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToDarkmode(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'language'),
                  icon: Icons.language_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToLanguage(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'font'),
                  icon: Icons.format_size_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToFont(context);
                  },
                ),

                SizedBox(height: 20.h),

                Text(
                  S.of(context, 'account'),
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),

                SizedBox(height: 20.h),

                SettingItem(
                  title: S.of(context, 'account'),
                  icon: Icons.person_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToAccount(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'privacy'),
                  icon: Icons.lock_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    //controller.goToAccount(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'activity'),
                  icon: Icons.access_time_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToActivity(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'activity'),
                  icon: Icons.thumb_up_alt_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    //controller.goToActivity(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'activity'),
                  icon: Icons.chat_bubble_outline_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    //controller.goToActivity(context);
                  },
                ),

                SizedBox(height: 20.h),

                Text(
                  S.of(context, 'notification'),
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),

                SizedBox(height: 20.h),

                SettingItem(
                  title: S.of(context, 'notification'),
                  icon: Icons.notifications_outlined,
                  color: cs.onSurface,
                  onTap: () {},
                ),

                SizedBox(height: 20.h),

                Text(
                  S.of(context, 'sign_in'),
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),
                
                SizedBox(height: 20.h),

                SettingItem(
                  title: S.of(context, 'switch_account'),
                  icon: Icons.swap_horiz_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.switchAccount(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: S.of(context, 'log_out'),
                  icon: Icons.logout_outlined,
                  color: Colors.red,
                  onTap: () {
                    controller.logout(context);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}
