import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/group/invite/invite_controller.dart';

class InviteView extends StatefulWidget {
  final String groupId;
  final String groupName;

  const InviteView({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  State<InviteView> createState() => _InviteViewState();
}

class _InviteViewState extends State<InviteView> {
  late InviteController controller;
  String searchQuery = '';
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    controller = InviteController(groupId: widget.groupId);
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
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    final filteredFriends = controller.friends.where((friend) {
      final username = (friend['username'] ?? '').toString().toLowerCase();
      return username.contains(searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: cs.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Mời vào ${widget.groupName}',
          style: TextStyle(
            color: cs.onSurface,
            fontSize: 18.sp,
            fontWeight: FontWeight.w500,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: searchController,
                onChanged: (val) {
                  setState(() {
                    searchQuery = val;
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Tìm kiếm bạn bè...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            searchController.clear();
                            setState(() {
                              searchQuery = '';
                            });
                          },
                        )
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: cs.outlineVariant),
                  ),
                  contentPadding: EdgeInsets.symmetric(vertical: 8.h),
                ),
              ),
              SizedBox(height: 16.h),
              Text(
                'Danh sách bạn bè',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurfaceVariant,
                ),
              ),
              SizedBox(height: 10.h),
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
                              onPressed: controller.fetchFriends,
                              child: const Text('Thử lại'),
                            ),
                          ],
                        ),
                      );
                    }

                    if (filteredFriends.isEmpty) {
                      return Center(
                        child: Text(
                          searchQuery.isEmpty ? 'Bạn chưa có người bạn nào.' : 'Không tìm thấy kết quả phù hợp.',
                          style: TextStyle(color: Colors.grey, fontSize: 14.sp),
                        ),
                      );
                    }

                    return ListView.separated(
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredFriends.length,
                      separatorBuilder: (context, index) => SizedBox(height: 12.h),
                      itemBuilder: (context, index) {
                        final friend = filteredFriends[index];
                        final friendId = friend['_id'] ?? '';
                        final username = friend['username'] ?? 'Người dùng';
                        final avatar = friend['avatar'] ?? '';
                        final isInvited = controller.invitedFriendIds.contains(friendId);

                        return Container(
                          padding: EdgeInsets.all(10.w),
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerLowest,
                            borderRadius: BorderRadius.circular(16.r),
                            border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 24.r,
                                backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,
                                child: avatar.isEmpty
                                    ? Text(
                                        username.substring(0, 1).toUpperCase(),
                                        style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w500),
                                      )
                                    : null,
                              ),
                              SizedBox(width: 12.w),
                              Expanded(
                                child: Text(
                                  username,
                                  style: TextStyle(
                                    fontSize: 15.sp,
                                    fontWeight: FontWeight.w500,
                                    color: cs.onSurface,
                                  ),
                                ),
                              ),
                              ElevatedButton(
                                onPressed: isInvited
                                    ? null
                                    : () async {
                                        final success = await controller.inviteFriend(friendId);
                                        if (success && mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Đã gửi lời mời tới $username!'),
                                              backgroundColor: Colors.green,
                                              duration: const Duration(seconds: 1),
                                            ),
                                          );
                                        }
                                      },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isInvited ? Colors.grey : Colors.blue,
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.r),
                                  ),
                                ).copyWith(
                                  overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                                ),
                                child: Text(
                                  isInvited ? 'Đã mời' : 'Mời',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w500,
                                  ),
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
