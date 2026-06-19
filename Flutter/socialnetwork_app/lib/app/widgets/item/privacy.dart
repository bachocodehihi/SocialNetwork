import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class PrivacyItem extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool value;
  final ValueChanged<bool> onChanged;
  final VoidCallback onTap;
  const PrivacyItem({
    super.key,
    required this.title,
    required this.icon,
    required this.value,
    required this.onChanged,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: 12.w,
          vertical: 6.h,
        ),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12.r),
          boxShadow: [
            BoxShadow(
              color: cs.shadow.withValues(alpha: 0.06),
              blurRadius: 6.r,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  icon,
                  color: cs.onSurface,
                  size: 20.sp,
                ),
                SizedBox(width: 10.w),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
              ],
            ),
            // Switch(
            //   value: value,
            //   onChanged: onChanged
            // ),
            // Switch(
            //   value: value,
            //   onChanged: onChanged,
            //   thumbColor: WidgetStateProperty.resolveWith<Color>((states) {
            //     if (states.contains(WidgetState.selected)) {
            //       return cs.onSurface;
            //     }
            //     return cs.onSurface;
            //   }),
            //   trackColor: WidgetStateProperty.resolveWith<Color>((states) {
            //     if (states.contains(WidgetState.selected)) {
            //       return Colors.blue;
            //     }
            //     return Colors.white;
            //   }),
            //   trackOutlineColor: WidgetStateProperty.resolveWith<Color>((states) {
            //     if (states.contains(WidgetState.selected)) {
            //       return Colors.blue;
            //     }
            //     return cs.onSurface;
            //   }),
            // ),

            Switch(
              value: value,
              onChanged: onChanged,
              thumbColor: WidgetStateProperty.resolveWith<Color>((states) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                
                if (states.contains(WidgetState.selected)) {
                  return Colors.white;
                }
                return isDark 
                    ? Colors.white
                    : Colors.black;
              }),
              trackColor: WidgetStateProperty.resolveWith<Color>((states) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                
                if (states.contains(WidgetState.selected)) {
                  return Colors.blue;
                }
                return isDark 
                    ? Colors.transparent
                    : Colors.transparent;
              }),
              trackOutlineColor: WidgetStateProperty.resolveWith<Color>((states) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                if (states.contains(WidgetState.selected)) {
                  return Colors.blue;
                }
                return isDark 
                    ? Colors.white
                    : Colors.black;
              }),
            ),
          ],
        ),
      ),
    );
  }
}