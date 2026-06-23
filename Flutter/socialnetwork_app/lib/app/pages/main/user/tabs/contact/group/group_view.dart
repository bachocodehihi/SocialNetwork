import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/contact/group/group_controller.dart';
import 'package:socialnetwork/app/pages/group/group_page.dart';

class ContactGroupView extends StatefulWidget {
  const ContactGroupView({super.key});

  @override
  State<ContactGroupView> createState() => _ContactGroupViewState();
}

class _ContactGroupViewState extends State<ContactGroupView> {
  late ContactGroupController controller;

  @override
  void initState() {
    super.initState();
    controller = ContactGroupController();
    controller.fetchGroups();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return ListenableBuilder(
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
                Icon(Icons.error_outline, size: 48, color: cs.error),
                SizedBox(height: 8.h),
                Text(
                  'Lỗi: ${controller.error}',
                  style: TextStyle(color: cs.error),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 12.h),
                ElevatedButton(
                  onPressed: controller.fetchGroups,
                  child: const Text('Thử lại'),
                ),
              ],
            ),
          );
        }

        return ListView(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Your groups',
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => controller.goToCreateGroup(context),
                  child: Row(
                    children: [
                      Icon(
                        Icons.add_circle_outline_outlined,
                        size: 25.sp, 
                        color: Colors.blue
                      ),
                      SizedBox(width: 5.w),
                      Text(
                        'Create',
                        style: TextStyle(
                          fontSize: 15.sp, 
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            SizedBox(height: 20.h),

            if (controller.groups.isEmpty)
              Center(
                child: Column(
                  children: [
                    SizedBox(height: 40.h),
                    Icon(Icons.group_outlined,
                        size: 48, color: cs.onSurfaceVariant),
                    SizedBox(height: 8.h),
                    Text(
                      'No groups yet',
                      style: TextStyle(
                        color: cs.onSurfaceVariant,
                        fontSize: 15.sp,
                      ),
                    ),
                  ],
                ),
              ),

            ...controller.groups.map((group) {
              final members = group['members'] as List? ?? [];
              final name = group['name'] ?? 'Group Chat';
              final avatar = group['avatar'];

              return InkWell(
                onTap: () {
                  final groupId = group['_id'] ?? '';
                  if (groupId.isNotEmpty) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => GroupPage(groupId: groupId),
                      ),
                    ).then((_) {
                      controller.fetchGroups();
                    });
                  }
                },
                borderRadius: BorderRadius.circular(16.r),
                child: Container(
                  margin: EdgeInsets.only(bottom: 12.h),
                  padding: EdgeInsets.all(12.w),
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(20.r),
                    border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 25.r,
                        backgroundColor: cs.primaryContainer,
                        backgroundImage: avatar != null && avatar.toString().isNotEmpty
                            ? NetworkImage(avatar)
                            : null,
                        child: (avatar == null || avatar.toString().isEmpty)
                            ? Text(
                                name.substring(0, 1).toUpperCase(),
                                style: TextStyle(
                                  color: cs.onPrimaryContainer,
                                  fontWeight: FontWeight.w500,
                                  fontSize: 18.sp,
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
                              name,
                              style: TextStyle(
                                fontSize: 15.sp,
                                fontWeight: FontWeight.w500,
                                color: cs.onSurface,
                              ),
                            ),
                            Text(
                              '${members.length} members',
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => controller.goToChat(context, group),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ).copyWith(
                          overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                        ),
                        child: Text(
                          'Message',
                          style: TextStyle(
                            fontSize: 15.sp,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }
}