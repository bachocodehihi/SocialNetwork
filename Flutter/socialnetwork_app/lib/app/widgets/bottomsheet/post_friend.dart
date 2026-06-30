import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class PostFriendBottomSheet extends StatelessWidget {
  const PostFriendBottomSheet({super.key});

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
                Language.of(context, 'privacy'),
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
                        Icons.people_alt_outlined, 
                        color: cs.onSurface,
                        size: 20.sp
                      ),
                    ),
                    title: Text(
                      Language.of(context, 'friend'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context, {'privacy': 'friends'});
                    },
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 4.w),
                    leading: CircleAvatar(
                      radius: 22.r,
                      backgroundColor: cs.surfaceContainerHighest,
                      child: Icon(
                        Icons.person_remove_outlined, 
                        color: cs.onSurface,
                        size: 20.sp
                      ),
                    ),
                    title: Text(
                      Language.of(context, 'friends_except'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context, {'action': 'open_friends_except'});
                    },
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 4.w),
                    leading: CircleAvatar(
                      radius: 22.r,
                      backgroundColor: cs.surfaceContainerHighest,
                      child: Icon(
                        Icons.person_add_outlined, 
                        color: cs.onSurface,
                        size: 20.sp
                      ),
                    ),
                    title: Text(
                      Language.of(context, 'specific_friends'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context, {'action': 'open_specific_friends'});
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