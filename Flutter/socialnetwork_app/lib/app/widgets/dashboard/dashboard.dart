import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
class DashboardCard extends StatelessWidget {
  final Widget child;
  const DashboardCard({
    super.key,
    required this.child,
  });
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      child: Container(
        padding: EdgeInsets.all(12.w),
        margin: EdgeInsets.only(bottom: 16.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16.r),
          boxShadow: [
            BoxShadow(
              color: Colors.grey,
              blurRadius: 2.r,
              offset: const Offset(2, 4),
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}
