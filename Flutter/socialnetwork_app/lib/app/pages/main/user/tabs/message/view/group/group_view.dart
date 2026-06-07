import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
import 'package:socialnetwork/app/pages/setting/account/delete/account/account_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class ViewGroupView extends StatefulWidget {
  const ViewGroupView({super.key});
  @override
  State<ViewGroupView> createState() => _ViewGroupViewState();
}

class _ViewGroupViewState extends State<ViewGroupView> {
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
                ],
              ),

              SizedBox(height: 20.h),

              Row(
                children: [
                  
                ],
              ),

              SizedBox(height: 20.h),

              SettingItem(
                title: S.of(context, 'image'),
                icon: Icons.image_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'member'),
                icon: Icons.group_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'call'),
                icon: Icons.call_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'report'),
                icon: Icons.warning_amber_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'block'),
                icon: Icons.block_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'delete_chat_history'),
                icon: Icons.delete_outlined,
                color: Colors.red,
                onTap: () {
                },
              ),

            ],    
          ),
        ),
      ),
    ); 
  }
}      
