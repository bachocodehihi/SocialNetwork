import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/main/admin/tabs/profile/profile_controller.dart';
import 'package:socialnetwork/app/widgets/avatar/fullscreen.dart';
import 'package:socialnetwork/app/widgets/item/information.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class ProfileAdminView extends StatefulWidget {
  const ProfileAdminView({super.key});

  @override
  State<ProfileAdminView> createState() => _ProfileAdminViewState();
}

class _ProfileAdminViewState extends State<ProfileAdminView> {
  late ProfileAdminController controller;

  @override
  void initState() {
    super.initState();
    controller = ProfileAdminController();
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
    return SafeArea(
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    Language.of(context, 'profile'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pushNamed(context, Routes.setting),
                    icon: Icon(
                      Icons.settings_outlined, 
                      size: 30.sp,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 10.h),
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: () {
                        if (controller.avatar.isNotEmpty) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => AvatarFullScreen(imageUrl: controller.avatar),
                            ),
                          );
                        }
                      },
                      child: Hero(
                        tag: 'profile_avatar',
                        child: CircleAvatar(
                          radius: 50.r,
                          backgroundImage: controller.avatar.isNotEmpty
                              ? NetworkImage(controller.avatar)
                              : null,
                          child: controller.avatar.isEmpty
                              ? Icon(
                                Icons.person_outlined, 
                                size: 30.sp
                              )
                              : null,
                        ),
                      ),
                    ),

                    SizedBox(height: 10.h),
                    
                    Text(
                      controller.username,
                      style: TextStyle(
                        color: cs.onSurface,
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 20.h),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        controller.goToAdd(context);
                      },
                      icon: const Icon(Icons.edit_outlined, size: 18),
                      label: const Text('Add profile'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        minimumSize: Size.fromHeight(44.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        controller.goToQRCode(context);
                      },
                      icon: const Icon(
                        Icons.qr_code_outlined, 
                        size: 18
                      ),
                      label: const Text('QR code'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey,
                        foregroundColor: Colors.white,
                        minimumSize: Size.fromHeight(44.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 20.h),

              Text(
                'Personal Information',
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),

              SizedBox(height: 20.h),

              if (controller.birthday.isNotEmpty)
                InformationItem(
                  value: controller.birthday,
                  title: Language.of(context, 'birthday'), 
                  icon: Icons.cake_outlined,
                ),

              if (controller.gender.isNotEmpty)
                InformationItem(
                  value: controller.gender, 
                  title: Language.of(context, 'gender'), 
                  icon: Icons.wc_outlined,
                ),

              if (controller.email.isNotEmpty) 
                InformationItem(
                  value: controller.email,
                  title: 'Email', 
                  icon: Icons.email_outlined,
                ),

              if (controller.address.isNotEmpty) 
                InformationItem(
                  value: controller.address, 
                  title: Language.of(context, 'address'),
                  icon: Icons.location_on_outlined,
                ),

              if (controller.phone.isNotEmpty) 
                InformationItem(
                  value: controller.phone, 
                  title: Language.of(context, 'phone'), 
                  icon: Icons.phone_outlined,
                ),
                
              if (controller.job.isNotEmpty) 
                InformationItem(
                  value: controller.job, 
                  title: Language.of(context, 'job'), 
                  icon: Icons.work_outline_outlined,
                ),

              if (controller.nationality.isNotEmpty)
                InformationItem(
                  value: controller.nationality, 
                  title: Language.of(context, 'nationality'), 
                  icon: Icons.public_outlined,
                ),



            ],
          ),
        ),
      ),
    );
  }

}
