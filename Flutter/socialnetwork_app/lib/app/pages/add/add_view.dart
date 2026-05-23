import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
import 'package:socialnetwork/app/pages/add/add_controller.dart';
class AddView extends StatefulWidget {
  const AddView({super.key});
  @override
  State<AddView> createState() => _AddViewState();
}
class _AddViewState extends State<AddView> {

  late AddController controller;

  @override
  void initState() {
    super.initState();
    controller = AddController();
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
                  SizedBox(width: 10.w),
                  Text(
                    'Add profile',
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
                  title: 'Address',
                  icon: Icons.location_on_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToAddAddress(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Phone',
                  icon: Icons.phone_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToAddPhone(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Job',
                  icon: Icons.work_outline_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToAddJob(context);
                  },
                ),

                SizedBox(height: 15.h),

                SettingItem(
                  title: 'Nationality',
                  icon: Icons.public_outlined,
                  color: cs.onSurface,
                  onTap: () {
                    controller.goToAddNationality(context);
                  },
                ),

            ],    
          ),
        ),
      ),
    ); 
  }
}      
