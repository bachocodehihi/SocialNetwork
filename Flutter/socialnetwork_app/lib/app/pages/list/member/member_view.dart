import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/list/member/member_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class ListMemberView extends StatefulWidget {
  final String groupId;
  const ListMemberView({super.key, required this.groupId});

  @override
  State<ListMemberView> createState() => _ListMemberViewState();
}

class _ListMemberViewState extends State<ListMemberView> {
  late MemberController controller;

  @override
  void initState() {
    super.initState();
    controller = MemberController(groupId: widget.groupId);
    controller.addListener(_onControllerChanged);
  }

  void _onControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    controller.removeListener(_onControllerChanged);
    controller.dispose();
    super.dispose();
  }

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.arrow_back_ios_outlined,
                      size: 20.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Text(
                    Language.of(context, 'member'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20.h),
              Expanded(
                child: ListenableBuilder(
                  listenable: controller,
                  builder: (context, _) {
                    if (controller.isLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (controller.error != null) {
                      return Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Đã xảy ra lỗi: ${controller.error}',
                              style: TextStyle(color: cs.error, fontSize: 14.sp),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: 10.h),
                            ElevatedButton(
                              onPressed: controller.fetchMembers,
                              child: const Text('Thử lại'),
                            ),
                          ],
                        ),
                      );
                    }

                    if (controller.members.isEmpty) {
                      return const Center(
                        child: Text(
                          'Không có thành viên nào.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      );
                    }

                    return ListView.separated(
                      physics: const BouncingScrollPhysics(),
                      itemCount: controller.members.length,
                      separatorBuilder: (context, index) => SizedBox(height: 12.h),
                      itemBuilder: (context, index) {
                        final member = controller.members[index];
                        final memberId = member['_id']?.toString() ?? '';
                        final username = member['username'] ?? 'Người dùng';
                        final avatar = member['avatar'] ?? '';
                        final isAdmin = memberId == controller.adminId;

                        return Container(
                          padding: EdgeInsets.all(12.w),
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(16.r),
                            border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 25.r,
                                backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,
                                child: avatar.isEmpty
                                    ? Text(
                                        username.isNotEmpty ? username.substring(0, 1).toUpperCase() : 'U',
                                        style: TextStyle(
                                          fontSize: 16.sp,
                                          fontWeight: FontWeight.w500,
                                          color: cs.onSurfaceVariant,
                                        ),
                                      )
                                    : null,
                              ),
                              SizedBox(width: 12.w),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      username,
                                      style: TextStyle(
                                        fontSize: 15.sp,
                                        fontWeight: FontWeight.w500,
                                        color: cs.onSurface,
                                      ),
                                    ),
                                    SizedBox(height: 4.h),
                                    Text(
                                      isAdmin 
                                          ? Language.of(context, 'group_leader') 
                                          : Language.of(context, 'member_role'),
                                      style: TextStyle(
                                        fontSize: 12.sp,
                                        color: isAdmin ? cs.onSurface : cs.onSurfaceVariant,
                                        fontWeight: isAdmin ? FontWeight.w500 : FontWeight.normal,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
