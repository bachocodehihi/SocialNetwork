import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/setting/account/account_controller.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
class SettingAccountView extends StatefulWidget {
  const SettingAccountView({super.key});

  @override
  State<SettingAccountView> createState() => _SettingAccountViewState();
}

class _SettingAccountViewState extends State<SettingAccountView> {
  
  late SettingAccountController controller;

  @override
  void initState() {
    super.initState();
    controller = SettingAccountController();
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
                      'Account',
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
                  title: 'Change information',
                  icon: Icons.assignment_ind_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChange(context);
                  },
                ),
                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Password',
                  icon: Icons.password_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToChange(context);
                  },
                ),

                SizedBox(height: 15.h),
                
                SettingItem(
                  title: 'Delete account',
                  icon: Icons.delete_outlined,
                  color: Colors.red,
                  onTap: () {
                    controller.goToDelete(context);
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
