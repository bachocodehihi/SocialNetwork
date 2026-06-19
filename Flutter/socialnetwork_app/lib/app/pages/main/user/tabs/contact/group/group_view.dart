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

  // void _showGroupInfo(BuildContext context, Map<String, dynamic> group) {
  //   final cs = Theme.of(context).colorScheme;
  //   final name = group['name'] ?? 'Group Chat';
  //   final avatar = group['avatar'];
  //   final members = group['members'] as List? ?? [];

  //   showModalBottomSheet(
  //     context: context,
  //     isScrollControlled: true,
  //     backgroundColor: cs.surface,
  //     shape: const RoundedRectangleBorder(
  //       borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
  //     ),
  //     builder: (context) => Container(
  //       padding: EdgeInsets.all(20.h),
  //       child: Column(
  //         mainAxisSize: MainAxisSize.min,
  //         children: [
  //           Container(
  //             width: 40.w,
  //             height: 4.h,
  //             decoration: BoxDecoration(
  //               color: cs.onSurfaceVariant.withValues(alpha: 0.3),
  //               borderRadius: BorderRadius.circular(2.r),
  //             ),
  //           ),
  //           SizedBox(height: 20.h),
  //           CircleAvatar(
  //             radius: 40.r,
  //             backgroundColor: cs.primaryContainer,
  //             backgroundImage: avatar != null && avatar.toString().isNotEmpty
  //                 ? NetworkImage(avatar)
  //                 : null,
  //             child: (avatar == null || avatar.toString().isEmpty)
  //                 ? Text(
  //                     name.substring(0, 1).toUpperCase(),
  //                     style: TextStyle(
  //                       color: cs.onPrimaryContainer,
  //                       fontSize: 24.sp,
  //                       fontWeight: FontWeight.w500,
  //                     ),
  //                   )
  //                 : null,
  //           ),
  //           SizedBox(height: 16.h),
  //           Text(
  //             name,
  //             style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w500),
  //           ),
  //           Text(
  //             '${members.length} members',
  //             style: TextStyle(color: cs.onSurfaceVariant, fontSize: 14.sp),
  //           ),
  //           SizedBox(height: 24.h),
  //           _buildOption(
  //             context,
  //             icon: Icons.chat_bubble_outline_rounded,
  //             title: 'Send message',
  //             onTap: () {
  //               Navigator.pop(context);
  //               controller.goToChat(context, group);
  //             },
  //           ),
  //           _buildOption(
  //             context,
  //             icon: Icons.people_outline_rounded,
  //             title: 'View members',
  //             onTap: () {
  //               Navigator.pop(context);
  //             },
  //           ),
  //           SizedBox(height: 16.h),
  //           Divider(color: cs.outlineVariant),
  //           _buildOption(
  //             context,
  //             icon: Icons.exit_to_app_rounded,
  //             title: 'Leave Group',
  //             color: Colors.red,
  //             onTap: () {
  //               // Implement leave logic
  //               Navigator.pop(context);
  //             },
  //           ),
  //           SizedBox(height: 20.h),
  //         ],
  //       ),
  //     ),
  //   );
  // }

  // Widget _buildOption(BuildContext context,
  //     {required IconData icon, required String title, required VoidCallback onTap, Color? color}) {
  //   final cs = Theme.of(context).colorScheme;
  //   return ListTile(
  //     leading: Icon(icon, color: color ?? cs.primary),
  //     title: Text(title, style: TextStyle(color: color ?? cs.onSurface, fontWeight: FontWeight.w500)),
  //     trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
  //     onTap: onTap,
  //   );
  // }
}