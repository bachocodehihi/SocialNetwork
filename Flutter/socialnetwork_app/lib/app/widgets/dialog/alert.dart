import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AppAlertDialog extends StatefulWidget {

  final IconData icon;
  final Color iconColor;
  final String message;

  const AppAlertDialog({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.message,
  });

  @override
  State<AppAlertDialog> createState() => _AppAlertDialogState();
}

class _AppAlertDialogState extends State<AppAlertDialog> {
  
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Dialog(
      backgroundColor: cs.surfaceContainerHigh,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 0 : 24.w,
          vertical: 28.h,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              widget.icon,
              size: 40.sp,
              color: widget.iconColor,
            ),
            SizedBox(height: 20.h),
            Text(
              widget.message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15.sp,
                fontWeight: FontWeight.w500,
                color: cs.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

}