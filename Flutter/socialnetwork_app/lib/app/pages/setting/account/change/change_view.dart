import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/setting/account/change/change_controller.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
class SettingChangeView extends StatefulWidget {
  const SettingChangeView({super.key});

  @override
  State<SettingChangeView> createState() => _SettingChangeViewState();
}

class _SettingChangeViewState extends State<SettingChangeView> {
  late SettingChangeController controller;

  @override
  void initState() {
    super.initState();
    controller = SettingChangeController();
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
                      'Change information',
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
                
                SettingItem(
                  title: 'Username',
                  icon: Icons.person_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeName(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Email',
                  icon: Icons.email_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeEmail(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Gender',
                  icon: Icons.wc_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeGender(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Birthday',
                  icon: Icons.cake_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeBirthday(context);
                  },
                ),

                SizedBox(height: 15.h),
                
                SettingItem(
                  title: 'Avatar',
                  icon: Icons.dark_mode_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeAvatar(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Address',
                  icon: Icons.location_on_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeAddress(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Phone',
                  icon: Icons.phone_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangePhone(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Job',
                  icon: Icons.work_outline_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeJob(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Nationality',
                  icon: Icons.public_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChangeNationality(context);
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
