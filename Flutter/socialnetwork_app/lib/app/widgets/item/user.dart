import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class UserItem extends StatelessWidget {
  final String avatarUrl;
  final String name;
  final VoidCallback onTap;
  const UserItem({
    super.key,
    required this.avatarUrl,
    required this.name,
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
          vertical: 14.h,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 24.r,
                  backgroundImage: NetworkImage(avatarUrl),
                ),
                SizedBox(width: 10.w),
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
              ],
            ),
            Icon(
              Icons.close_outlined, 
              color: cs.onSurface,
              size: 20.sp,
            ),
          ],
        ),
      ),
    );
  }
    
}