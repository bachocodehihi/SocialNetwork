import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/list/member/member_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/pages/group/invite/invite_page.dart';

class ListMemberView extends StatefulWidget {
  final String groupId;
  const ListMemberView({super.key, required this.groupId});

  @override
  State<ListMemberView> createState() => _ListMemberViewState();
}

class _ListMemberViewState extends State<ListMemberView> {
  late MemberController controller;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    controller = MemberController(groupId: widget.groupId);
    controller.addListener(_onControllerChanged);
    _searchController.addListener(() => setState(() {}));
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
    _searchController.dispose();
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

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    GestureDetector(
                      onTap: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => InvitePage(
                              groupId: widget.groupId,
                              groupName: controller.group['name'] ?? '',
                            ),
                          ),
                        );
                        controller.fetchMembers();
                      },
                      child: Icon(
                        Icons.group_add_outlined,
                        size: 25.sp,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Colors.grey,
                      width: 1.w,
                    ),
                    borderRadius: BorderRadius.circular(50.r),
                    color: Colors.transparent,
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      controller.setSearchQuery(val);
                    },
                    textAlignVertical: TextAlignVertical.center,
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface,
                    ),
                    decoration: InputDecoration(
                      isDense: true,
                      hintText: '${Language.of(context, 'search')}...',
                      hintStyle: TextStyle(
                        fontSize: 15.sp,
                        color: Colors.grey,
                      ),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 12.h,
                        horizontal: 15.w,
                      ),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? GestureDetector(
                              onTap: () {
                                _searchController.clear();
                                controller.setSearchQuery('');
                              },
                              child: Icon(
                                Icons.clear_outlined,
                                color: Colors.grey,
                                size: 20.sp,
                              ),
                            )
                          : null,
                    ),
                  ),
                ),
                SizedBox(height: 20.h),
                Expanded(
                  child: ListenableBuilder(
                    listenable: controller,
                    builder: (context, _) {
                      if (controller.isLoading && controller.members.isEmpty) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      if (controller.error != null && controller.members.isEmpty) {
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

                      final filteredMembers = controller.filteredMembers;

                      if (filteredMembers.isEmpty) {
                        return Center(
                          child: Text(
                            controller.searchQuery.isEmpty
                                ? 'Không có thành viên nào.'
                                : (Language.of(context, 'search') == 'Tìm kiếm'
                                    ? 'Không tìm thấy thành viên.'
                                    : 'No members found.'),
                            style: const TextStyle(color: Colors.grey),
                          ),
                        );
                      }

                      return ListView.separated(
                        physics: const BouncingScrollPhysics(),
                        itemCount: filteredMembers.length,
                        separatorBuilder: (context, index) => SizedBox(height: 12.h),
                        itemBuilder: (context, index) {
                          final member = filteredMembers[index];
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
      ),
    );
  }
}
