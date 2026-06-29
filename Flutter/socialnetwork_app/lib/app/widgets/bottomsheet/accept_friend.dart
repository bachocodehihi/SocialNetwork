import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class AcceptFriendBottomSheet extends StatelessWidget {
  final VoidCallback onAcceptFriend;
  final VoidCallback onRejectFriend;
  const AcceptFriendBottomSheet({
    super.key,
    required this.onAcceptFriend,
    required this.onRejectFriend,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16.r)),
      ),
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40.w,
            height: 4.h,
            margin: EdgeInsets.only(bottom: 12.h),
            decoration: BoxDecoration(
              color: cs.onSurface.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(2.r),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              
              Text(
                Language.of(context, ''),
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),
            ],
          ),

          SizedBox(height: 6.h),

          Divider(color: cs.onSurface.withValues(alpha: 0.1)),
          
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 4.w),
                    leading: CircleAvatar(
                      radius: 22.r,
                      backgroundColor: cs.surfaceContainerHighest,
                      child: Icon(
                        Icons.add_outlined, 
                        color: cs.onSurface,
                        size: 20.sp
                      ),
                    ),
                    title: Text(
                      Language.of(context, 'accept'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      onAcceptFriend();
                    },
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 4.w),
                    leading: CircleAvatar(
                      radius: 22.r,
                      backgroundColor: cs.surfaceContainerHighest,
                      child: Icon(
                        Icons.add_outlined, 
                        color: cs.onSurface,
                        size: 20.sp
                      ),
                    ),
                    title: Text(
                      Language.of(context, 'reject'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      onRejectFriend();
                    },
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 4.w),
                    leading: CircleAvatar(
                      radius: 22.r,
                      backgroundColor: cs.surfaceContainerHighest,
                      child: Icon(
                        Icons.close_outlined, 
                        color: cs.onSurface,
                        size: 20.sp
                      ),
                    ),
                    title: Text(
                      Language.of(context, 'cancel'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 8.h),
        ],
      ),
    );
  }
}