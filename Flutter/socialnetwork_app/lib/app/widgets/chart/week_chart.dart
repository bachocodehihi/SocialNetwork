import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
class WeekChart extends StatelessWidget {
  const WeekChart({
    super.key,
    required this.values,
    required this.labels,
    required this.todayIndex,
    required this.maxBarHeight,
  });

  final List<int> values;
  final List<String> labels;
  final int todayIndex;
  final double maxBarHeight;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    const double maxVal = 1440.0;

    return Container(
      padding: EdgeInsets.fromLTRB(12.w, 20.h, 12.w, 20.h),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: cs.shadow.withValues(alpha: 0.06),
            blurRadius: 8.r,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(values.length, (i) {
          final isToday = i == todayIndex;
          final isFuture = i > todayIndex;
          final barH = (values[i] / maxVal) * maxBarHeight;
          final barColor = isFuture
              ? cs.onSurface.withValues(alpha: 0.1)
              : isToday
                  ? cs.primary
                  : cs.primary.withValues(alpha: 0.45);

          return Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    height: isFuture ? 4.h : math.max(6.h, barH),
                    decoration: BoxDecoration(
                      color: barColor,
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Text(
                    labels[i],
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
                      color: isToday ? cs.primary : cs.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Container(
                    width: 5.w,
                    height: 5.h,
                    decoration: BoxDecoration(
                      color: isToday ? cs.primary : Colors.transparent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}