import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class SwitchAccountBottomSheet extends StatelessWidget {
  final List<Map<String, dynamic>> accounts;
  final String? currentEmail;
  final void Function(String email) onSelectEmail;
  final VoidCallback onAddAccount;

  const SwitchAccountBottomSheet({
    super.key,
    required this.accounts,
    required this.currentEmail,
    required this.onSelectEmail,
    required this.onAddAccount,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SizedBox(width: 24.w),
              Text(
                Language.of(context, 'switch_account'),
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),
              IconButton(
                icon: Icon(
                  Icons.close_outlined, 
                  color: cs.onSurface,
                  size: 20.sp
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          Divider(color: cs.onSurface.withValues(alpha: 0.1)),
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ...accounts.map((account) {
                    final email = account['email'] as String;
                    final username = account['username'] as String? ?? email.split('@')[0];
                    final avatar = account['avatar'] as String?;
                    final isActive = email == currentEmail;

                    return _AccountTile(
                      email: email,
                      username: username,
                      avatar: avatar,
                      isActive: isActive,
                      onTap: isActive
                          ? null
                          : () {
                              Navigator.pop(context);
                              onSelectEmail(email);
                            },
                    );
                  }),
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
                      Language.of(context, 'add_account'),
                      style: TextStyle(
                        fontSize: 15.sp, 
                        color: cs.onSurface
                      ),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      onAddAccount();
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

class _AccountTile extends StatelessWidget {
  final String email;
  final String username;
  final String? avatar;
  final bool isActive;
  final VoidCallback? onTap;

  const _AccountTile({
    required this.email,
    required this.username,
    required this.avatar,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ListTile(
      contentPadding: EdgeInsets.symmetric(horizontal: 4.w),
      leading: CircleAvatar(
        radius: 22.r,
        backgroundImage: avatar != null ? NetworkImage(avatar!) : null,
        backgroundColor: Colors.pinkAccent.shade100,
        child: avatar == null
            ? Text(
                username.substring(0, 2).toLowerCase(),
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                  fontSize: 15.sp,
                ),
              )
            : null,
      ),
      title: Text(
        username,
        style: TextStyle(
          fontSize: 15.sp,
          color: cs.onSurface,
          fontWeight: isActive ? FontWeight.w500 : FontWeight.normal,
        ),
      ),
      subtitle: Text(
        email,
        style: TextStyle(
          fontSize: 12.sp,
          color: cs.onSurface.withValues(alpha: 0.5),
        ),
      ),
      trailing: isActive
          ? Icon(
            Icons.check_outlined, 
            color: Colors.green, 
            size: 20.sp
          ) : null,
      onTap: onTap,
    );
  }
}