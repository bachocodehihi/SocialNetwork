import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/warming/warming_controller.dart';
import 'package:socialnetwork/app/routes/routes.dart';

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

              // Beautiful glowing golden warning icon
              Container(
                width: 100.w,
                height: 100.w,
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.amber.withOpacity(0.3),
                    width: 2.w,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.withOpacity(0.05),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(
                    Icons.warning_amber_rounded,
                    size: 50.sp,
                    color: Colors.amber[700],
                  ),
                ),
              ),

              SizedBox(height: 32.h),

              // Title
              Text(
                'Yêu Cầu Xóa Tài Khoản',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22.sp,
                  fontWeight: FontWeight.bold,
                  color: cs.onSurface,
                  letterSpacing: 0.5,
                ),
              ),

              SizedBox(height: 16.h),

              // Subtitle
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.w),
                child: Text(
                  'Tài khoản của bạn đã được ghi nhận yêu cầu xóa và đang trong thời gian xem xét. Bạn có thể thay đổi quyết định này trước thời hạn xóa vĩnh viễn.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: cs.onSurface.withOpacity(0.7),
                    height: 1.5,
                  ),
                ),
              ),

              SizedBox(height: 32.h),

              // Elegant details card
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(20.w),
                decoration: BoxDecoration(
                  color: brightness == Brightness.dark
                      ? Colors.grey[900]
                      : Colors.grey[50],
                  borderRadius: BorderRadius.circular(16.r),
                  border: Border.all(
                    color: cs.onSurface.withOpacity(0.1),
                    width: 1.w,
                  ),
                ),
                child: Column(
                  children: [
                    _buildDetailRow(
                      context,
                      label: 'Trạng thái',
                      value: 'Đang xem xét',
                      valueColor: Colors.orange[700]!,
                      isBoldValue: true,
                    ),
                    Divider(color: cs.onSurface.withOpacity(0.08), height: 24.h),
                    _buildDetailRow(
                      context,
                      label: 'Thời gian yêu cầu',
                      value: controller.getFormattedRequestTime(),
                    ),
                    Divider(color: cs.onSurface.withOpacity(0.08), height: 24.h),
                    _buildDetailRow(
                      context,
                      label: 'Hạn xóa vĩnh viễn',
                      value: controller.getFormattedDeletionTime(),
                      valueColor: Colors.red[600]!,
                      isBoldValue: true,
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 2),

              // Back to Home button
              MouseRegion(
                cursor: SystemMouseCursors.click,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    minimumSize: Size(double.infinity, 50.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.r),
                    ),
                    elevation: 2,
                  ).copyWith(
                    overlayColor: WidgetStateProperty.all(Colors.white.withOpacity(0.1)),
                  ),
                  onPressed: () async {
                    final target = await Routes.getDashboardRoute();
                    if (!context.mounted) return;
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      target,
                      (route) => false,
                    );
                  },
                  child: Text(
                    'Quay lại trang chủ',
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context, {
    required String label,
    required String value,
    Color? valueColor,
    bool isBoldValue = false,
  }) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14.sp,
            color: cs.onSurface.withOpacity(0.55),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14.sp,
            fontWeight: isBoldValue ? FontWeight.bold : FontWeight.w500,
            color: valueColor ?? cs.onSurface,
          ),
        ),
      ],
    );
  }
}
