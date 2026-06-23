import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/warming/warming_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class WarmingView extends StatefulWidget {
  const WarmingView({super.key});

  @override
  State<WarmingView> createState() => _WarmingViewState();
}

class _WarmingViewState extends State<WarmingView> {
  late WarmingController controller;

  @override
  void initState() {
    super.initState();
    controller = WarmingController();
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
            vertical: 24.h,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),

              Container(
                width: 100.w,
                height: 100.w,
                decoration: BoxDecoration(
                  color: Colors.yellow.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.yellow.withValues(alpha: 0.3),
                    width: 2.w,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.yellow.withValues(alpha: 0.05),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(
                    Icons.warning_amber_rounded,
                    size: 50.sp,
                    color: Colors.yellow,
                  ),
                ),
              ),

              SizedBox(height: 32.h),

              Text(
                'Yêu Cầu Xóa Tài Khoản',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),

              SizedBox(height: 16.h),

              Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.w),
                child: Text(
                  'Tài khoản của bạn đã được ghi nhận yêu cầu xóa và đang trong thời gian xem xét. Bạn có thể thay đổi quyết định này trước thời hạn xóa vĩnh viễn.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: cs.onSurface.withValues(alpha: 0.7),
                    height: 1.5,
                  ),
                ),
              ),

              const Spacer(),

              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  minimumSize: Size(double.infinity, 48.h),
                  shape: const StadiumBorder(),
                ).copyWith(
                  overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                ),
                onPressed: () => controller.returnToHomepage(context),
                child: Text(
                  Language.of(context, 'return_to_homepage'),
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: Colors.white
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
