import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class BannerNetwork extends StatelessWidget {
  
  const BannerNetwork({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: Colors.red.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(color: Colors.red),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.wifi_off_outlined,
              color: Colors.red,
              size: 20.sp,
            ),

            SizedBox(width: 10.w),
            
            Expanded(
              child: Text(
                Language.of(context, 'no_network_connection'),
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 15.sp,
                ),
              ),
            ),

            SizedBox(
              width: 20.sp,
              height: 20.sp,
              child: CircularProgressIndicator(
                color: Colors.red,
                strokeWidth: 2.w,
              ),
            )
          ],
        ),
      ),
    );
  }
}