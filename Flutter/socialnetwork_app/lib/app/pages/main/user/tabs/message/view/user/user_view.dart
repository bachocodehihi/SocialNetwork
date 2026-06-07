import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';

class ViewUserView extends StatefulWidget {
  final String userId;
  final String userName;
  final String userAvatar;

  const ViewUserView({
    super.key,
    this.userId = '',
    this.userName = '',
    this.userAvatar = '',
  });

  @override
  State<ViewUserView> createState() => _ViewUserViewState();
}

class _ViewUserViewState extends State<ViewUserView> {

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness:
            brightness == Brightness.dark ? Brightness.light : Brightness.dark,
      ),
    );
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(    
            horizontal: kIsWeb ? 0 : 24.w,
            vertical: 16.h,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: Icon(
                      Icons.arrow_back_ios_outlined, 
                      size: 20.sp,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),

              SizedBox(height: 40.h),

              CircleAvatar(
                radius: 50.r,
                backgroundColor: cs.primaryContainer,
                backgroundImage: widget.userAvatar.isNotEmpty
                    ? NetworkImage(widget.userAvatar)
                    : null,
                child: widget.userAvatar.isEmpty
                    ? Text(
                        widget.userName.isNotEmpty 
                            ? widget.userName.substring(0, 1).toUpperCase() 
                            : 'U',
                        style: TextStyle(
                          color: cs.onPrimaryContainer,
                          fontSize: 32.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      )
                    : null,
              ),

              SizedBox(height: 10.h),

              Text(
                widget.userName,
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),

              SizedBox(height: 20.h),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: _buildFunctionItem(
                      Icons.person_outlined,
                      S.of(context, 'personal_page'),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => UserPage(
                              userData: {
                                '_id': widget.userId,
                                'username': widget.userName,
                                'avatar': widget.userAvatar,
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  Expanded(
                    child: _buildFunctionItem(
                      Icons.edit_outlined,
                      S.of(context, 'edit_name'),
                      onTap: () {
                        
                      },
                    ),
                  ),

                  Expanded(
                    child: _buildFunctionItem(
                      Icons.notifications_outlined,
                      S.of(context, 'notification'),
                      onTap: () {
                        
                      },
                    ),
                  ),
                ],
              ),

              SizedBox(height: 20.h),

              SettingItem(
                title: S.of(context, 'image'),
                icon: Icons.image_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'call'),
                icon: Icons.call_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'report'),
                icon: Icons.warning_amber_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'block'),
                icon: Icons.block_outlined,
                color: cs.onSurface,
                onTap: () {
                },
              ),

              SizedBox(height: 15.h),

              SettingItem(
                title: S.of(context, 'delete_chat_history'),
                icon: Icons.delete_outlined,
                color: Colors.red,
                onTap: () {

                },
              ),

            ],    
          ),
        ),
      ),
    ); 
  }

  Widget _buildFunctionItem(
    IconData icon,
    String title, 
    {VoidCallback? onTap,
  }) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Icon(
            icon,
            size: 20.sp,
            color: cs.onSurface,
          ),
          SizedBox(height: 2.h),
          Text(
            title,
            style: TextStyle(
              color: cs.onSurface,
              fontSize: 12.sp,
            ),
          ),
        ],
      ),
    );
  }
}      
