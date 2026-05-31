import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
class InformationItem extends StatelessWidget {
  final String value;
  final String title;
  const InformationItem({
    super.key,
    required this.value,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      margin: EdgeInsets.only(bottom: 15.h),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14.r),
        boxShadow: [
          BoxShadow(
            color: cs.shadow.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ), 
        ],
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 15.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface,
            ),
          ),

          SizedBox(height: 5.h),

          Text(
            title, 
            style: TextStyle(
              fontSize: 13.sp, 
              color: cs.onSurfaceVariant
            ),
          ),
        ],
      ),
    );
  }

}