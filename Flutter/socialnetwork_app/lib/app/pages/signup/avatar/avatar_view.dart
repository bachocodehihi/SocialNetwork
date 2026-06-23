import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/signup/avatar/avatar_controller.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class SignUpAvatarView extends StatefulWidget {
  const SignUpAvatarView({super.key});

  @override
  State<SignUpAvatarView> createState() => _SignUpAvatarViewState();
}

class _SignUpAvatarViewState extends State<SignUpAvatarView> {
  
  late SignUpAvatarController controller;

  @override
  void initState() {
    super.initState();
    controller = SignUpAvatarController();
    controller.addListener(() => setState(() {}));
  }

  ImageProvider avatarProvider() {
    if (controller.pickedImage != null) {
      if (kIsWeb) {
        return NetworkImage(controller.pickedImage!.path);
      } else {
        return FileImage(File(controller.pickedImage!.path));
      }
    }
    return const AssetImage('assets/avatar/avatar.jpg');
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
                      onTap: () {
                        Navigator.pop(context);
                      } ,
                      child: Icon(
                        Icons.arrow_back_ios_outlined,
                        size: 20.sp,
                        color: cs.onSurface,
                      ),
                    ),
                    SizedBox(width: 10.w),
                    Text(
                      Language.of(context, 'select_avatar'),
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
                  Language.of(context, 'select_your_avatar'),
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),

                SizedBox(height: 10.h),
                Text(
                  'Tap the avatar to choose a photo from your gallery.',
                  style: TextStyle(
                    fontSize: 13.sp,
                    color: cs.onSurfaceVariant,
                  ),
                ),

                SizedBox(height: 40.h),
                Center(
                  child: GestureDetector(
                    onTap: controller.pickImage,
                    child: Container(
                      width: 125.w,
                      height: 125.w,
                      padding: const EdgeInsets.all(1),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.blue,
                          width: 2.w,
                        ),
                      ),
                      child: Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          ClipOval(
                            child: SizedBox(
                              width: double.infinity,
                              height: double.infinity,
                              child: Image(
                                image: avatarProvider(),
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  color: Colors.grey.shade200,
                                  child: Icon(
                                    Icons.person,
                                    size: 60.sp,
                                    color: Colors.grey,
                                  ),
                                ),
                              ),
                            ),
                          ),

                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Colors.blue,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.image_outlined,
                              size: 20.sp,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
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
                    overlayColor:
                        WidgetStateProperty.all(Colors.grey[300]),
                  ),
                  onPressed: controller.isLoading
                      ? null
                      : () => controller.submitAvatar(context),
                  child: controller.isLoading
                      ? const CircularProgressIndicator(
                          color: Colors.white)
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
      ),
    );
  }
}