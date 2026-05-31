import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/admin/tabs/home/home_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/widgets/banner/network.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';

class HomeAdminView extends StatefulWidget {
  const HomeAdminView({super.key});

  @override
  State<HomeAdminView> createState() => _HomeAdminViewState();
}

class _HomeAdminViewState extends State<HomeAdminView> {
  late HomeAdminController controller;

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
        physics: const AlwaysScrollableScrollPhysics(),
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
                  Row(
                    children: [
                      Text(
                        S.of(context, 'home'),
                        style: TextStyle(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () {
                          //controller.goToSearch(context);
                        },
                        child: Icon(
                          Icons.search_outlined, 
                          size: 30.sp,
                          color: cs.onSurface,
                        ),
                      ),

                      SizedBox(width: 10.w),

                      GestureDetector(
                        onTap: () {
                          //controller.goToScanner(context);
                        },
                        child: Icon(
                          Icons.qr_code_scanner_outlined, 
                          size: 30.sp,
                          color: cs.onSurface,
                        ),
                      ),

                      SizedBox(width: 10.w),

                      Builder(
                        builder: (context) => GestureDetector(
                          onTap: () {
                            Scaffold.of(context).openDrawer();
                          },
                          child: Icon(
                            Icons.menu_outlined, 
                            size: 30.sp,
                            color: cs.onSurface,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              SizedBox(height: 20.h),

              // Visibility(
              //   visible: controller.isOffline,
              //   child: BannerNetwork(message: S.of(context, 'no_internet')),
              // ),

              SizedBox(height: 20.h),

              // GestureDetector(
              //   onTap: () {
              //     //controller.goToPostContent(context);
              //   },
              //   child: Row(
              //     children: [
              //       CircleAvatar(
              //         radius: 28.r,
              //         backgroundImage: controller.avatar.isNotEmpty
              //             ? NetworkImage(controller.avatar)
              //             : null,
              //         child: controller.avatar.isEmpty
              //             ? Icon(
              //               Icons.person_outlined, 
              //               size: 30.sp
              //             )
              //             : null,
              //       ),
              //       SizedBox(width: 10.w),
              //       Expanded(
              //         child: AbsorbPointer(
              //           child: TextField(
              //             decoration: InputDecoration(
              //               hintText: S.of(context, 'what_s_on_your_mind'),
              //               hintStyle: TextStyle(
              //                 fontSize: 15.sp,
              //                 color: Colors.grey,
              //               ),
              //               filled: false,
              //               border: OutlineInputBorder(
              //                 borderRadius: BorderRadius.circular(8.r),
              //                 borderSide: BorderSide(
              //                   color: Colors.grey,
              //                 ),
              //               ),
              //               enabledBorder: OutlineInputBorder(
              //                 borderRadius: BorderRadius.circular(8.r),
              //                 borderSide: BorderSide(color: Colors.grey, width: 1),
              //               ),
              //               focusedBorder: OutlineInputBorder(
              //                 borderRadius: BorderRadius.circular(8.r),
              //                 borderSide: BorderSide(color: Colors.grey, width: 1),
              //               ),
              //               contentPadding: EdgeInsets.symmetric(
              //                 vertical: 14.h,
              //                 horizontal: 12.w,
              //               ),
              //             ),
              //           ),
              //         ),
              //       ),
              //     ],
              //   ),
              // ),
            ],
          ),
        ),
      ),
    );
  }
}
