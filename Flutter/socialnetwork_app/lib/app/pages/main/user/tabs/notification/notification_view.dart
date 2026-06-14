import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/notification/notification_controller.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';
import 'package:socialnetwork/app/pages/group/group_page.dart';
import 'package:socialnetwork/data/config/config.dart';

class NotificationUserView extends StatefulWidget {
  const NotificationUserView({super.key});

  @override
  State<NotificationUserView> createState() => _NotificationUserViewState();
}

class _NotificationUserViewState extends State<NotificationUserView> {
  late final NotificationUserController _controller;

  @override
  void initState() {
    super.initState();
    _controller = NotificationUserController();
    _controller.addListener(_onControllerChanged);
  }

  void _onControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    super.dispose();
  }

  String _formatTimeAgo(dynamic dateVal) {
    if (dateVal == null) return '';
    try {
      final dt = DateTime.parse(dateVal.toString()).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inSeconds < 60) return 'Vừa xong';
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      if (diff.inDays < 7) return '${diff.inDays} ngày trước';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return dateVal.toString();
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'friend_request':
        return Icons.person_add_alt_1_rounded;
      case 'friend_accept':
        return Icons.handshake_rounded;
      case 'post_like':
        return Icons.thumb_up_rounded;
      case 'post_comment':
        return Icons.comment_rounded;
      case 'new_post':
        return Icons.feed_rounded;
      case 'group_invite':
        return Icons.group_add_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _getTypeColor(String type, ColorScheme cs) {
    switch (type) {
      case 'friend_request':
        return Colors.orangeAccent;
      case 'friend_accept':
        return Colors.green;
      case 'post_like':
        return Colors.blue;
      case 'post_comment':
        return Colors.teal;
      case 'new_post':
        return cs.primary;
      case 'group_invite':
        return Colors.indigo;
      default:
        return cs.primary;
    }
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

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => _controller.loadNotifications(),
        color: cs.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
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
                    Text(
                      Language.of(context, 'notification'),
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                      ),
                    ),
                    if (_controller.notifications.any((n) => !(n['isRead'] ?? false)))
                      IconButton(
                        onPressed: () => _controller.markAllRead(),
                        icon: Icon(
                          Icons.done_all_rounded,
                          size: 26.sp,
                          color: cs.primary,
                        ),
                        tooltip: Language.of(context, 'mark_all_as_read'),
                      ),
                  ],
                ),
                SizedBox(height: 10.h),
                if (_controller.loading && _controller.notifications.isEmpty)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 100.h),
                      child: const CircularProgressIndicator(),
                    ),
                  )
                else if (_controller.notifications.isEmpty)
                  Padding(
                    padding: EdgeInsets.symmetric(vertical: 80.h),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: EdgeInsets.all(24.w),
                            decoration: BoxDecoration(
                              color: cs.primaryContainer.withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.notifications_none_rounded,
                              size: 64.sp,
                              color: cs.primary.withValues(alpha: 0.7),
                            ),
                          ),
                          SizedBox(height: 16.h),
                          Text(
                            'Không có thông báo nào',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: cs.onSurface,
                            ),
                          ),
                          SizedBox(height: 6.h),
                          Text(
                            'Khi có lời mời kết bạn hoặc tương tác,\nthông báo của bạn sẽ hiển thị ở đây.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13.sp,
                              color: cs.onSurfaceVariant,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...List.generate(
                    _controller.notifications.length,
                    (index) {
                      final item = _controller.notifications[index];
                      final isRead = item['isRead'] ?? false;
                      final sender = item['sender'] as Map? ?? {};
                      final senderName = sender['username'] ?? 'Một người dùng';
                      final rawAvatar = sender['avatar'] ?? '';
                      final senderAvatar = (rawAvatar.isNotEmpty && !rawAvatar.startsWith('http'))
                          ? '${Config.baseUrl}$rawAvatar'
                          : rawAvatar;
                      final timeStr = _formatTimeAgo(item['createdAt']);
                      final type = item['type'] ?? '';

                      return GestureDetector(
                        onTap: () {
                          // Mark notification as read
                          if (!isRead) {
                            item['isRead'] = true;
                            setState(() {});
                          }

                          if (type == 'group_invite') {
                            final groupId = item['relatedId'] ?? '';
                            if (groupId.isNotEmpty) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => GroupPage(groupId: groupId),
                                ),
                              );
                            }
                          } else if (sender.isNotEmpty) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => UserPage(userData: Map<String, dynamic>.from(sender)),
                              ),
                            );
                          }
                        },
                        child: Container(
                          margin: EdgeInsets.only(bottom: 10.h),
                          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
                          decoration: BoxDecoration(
                            color: isRead ? cs.surfaceContainerLowest : cs.primaryContainer.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(14.r),
                            border: Border.all(
                              color: isRead ? cs.outlineVariant.withValues(alpha: 0.4) : cs.primary.withValues(alpha: 0.15),
                              width: 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: cs.shadow.withValues(alpha: 0.04),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Stack(
                                children: [
                                  CircleAvatar(
                                    radius: 22.r,
                                    backgroundImage: senderAvatar.isNotEmpty ? NetworkImage(senderAvatar) : null,
                                    child: senderAvatar.isEmpty
                                        ? Text(
                                            senderName.substring(0, 1).toUpperCase(),
                                            style: TextStyle(
                                              color: cs.onPrimaryContainer,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          )
                                        : null,
                                  ),
                                  Positioned(
                                    right: 0,
                                    bottom: 0,
                                    child: Container(
                                      padding: EdgeInsets.all(3.w),
                                      decoration: BoxDecoration(
                                        color: _getTypeColor(type, cs),
                                        shape: BoxShape.circle,
                                        border: Border.all(color: cs.surface, width: 1.5),
                                      ),
                                      child: Icon(
                                        _getTypeIcon(type),
                                        size: 10.sp,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(width: 12.w),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['title'] ?? '',
                                      style: TextStyle(
                                        fontSize: 13.5.sp,
                                        fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                                        color: cs.onSurface,
                                      ),
                                    ),
                                    SizedBox(height: 4.h),
                                    Text(
                                      item['body'] ?? '',
                                      style: TextStyle(
                                        fontSize: 12.5.sp,
                                        color: cs.onSurfaceVariant,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    SizedBox(height: 6.h),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.access_time_rounded,
                                          size: 11.sp,
                                          color: cs.onSurfaceVariant.withValues(alpha: 0.6),
                                        ),
                                        SizedBox(width: 4.w),
                                        Text(
                                          timeStr,
                                          style: TextStyle(
                                            fontSize: 11.sp,
                                            color: cs.onSurfaceVariant.withValues(alpha: 0.8),
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (type == 'friend_request') ...[
                                      SizedBox(height: 8.h),
                                      _buildFriendRequestActions(context, item, cs),
                                    ],
                                  ],
                                ),
                              ),
                              if (!isRead)
                                Container(
                                  width: 8.r,
                                  height: 8.r,
                                  margin: EdgeInsets.only(left: 8.w),
                                  decoration: BoxDecoration(
                                    color: cs.primary,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFriendRequestActions(BuildContext context, Map<String, dynamic> item, ColorScheme cs) {
    final requestId = item['relatedId']?.toString() ?? '';
    if (requestId.isEmpty) return const SizedBox.shrink();

    final isProcessedLocally = _controller.isProcessed(requestId);
    final localAction = _controller.getProcessedAction(requestId);
    final serverStatus = item['requestStatus']?.toString() ?? 'pending';

    final String status;
    if (isProcessedLocally) {
      status = localAction == 'accepted' ? 'accepted' : 'rejected';
    } else {
      status = serverStatus;
    }

    if (status == 'accepted') {
      return Padding(
        padding: EdgeInsets.only(top: 4.h),
        child: Row(
          children: [
            Icon(
              Icons.check_circle_outline_rounded,
              size: 14.sp,
              color: Colors.green,
            ),
            SizedBox(width: 4.w),
            Text(
              'Đã đồng ý lời mời kết bạn',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: Colors.green,
              ),
            ),
          ],
        ),
      );
    } else if (status == 'rejected') {
      return Padding(
        padding: EdgeInsets.only(top: 4.h),
        child: Row(
          children: [
            Icon(
              Icons.cancel_outlined,
              size: 14.sp,
              color: cs.error,
            ),
            SizedBox(width: 4.w),
            Text(
              'Đã từ chối lời mời kết bạn',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: cs.error,
              ),
            ),
          ],
        ),
      );
    } else if (status == 'cancelled' || status == 'deleted') {
      return Padding(
        padding: EdgeInsets.only(top: 4.h),
        child: Row(
          children: [
            Icon(
              Icons.info_outline_rounded,
              size: 14.sp,
              color: cs.outline,
            ),
            SizedBox(width: 4.w),
            Text(
              'Lời mời đã bị thu hồi',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: cs.outline,
              ),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.only(top: 6.h),
      child: Row(
        children: [
          ElevatedButton(
            onPressed: () => _controller.acceptFriend(requestId),
            style: ElevatedButton.styleFrom(
              backgroundColor: cs.primary,
              foregroundColor: cs.onPrimary,
              elevation: 0,
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              minimumSize: Size(0, 32.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            child: Text(
              'Đồng ý',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          SizedBox(width: 8.w),
          OutlinedButton(
            onPressed: () => _controller.rejectFriend(requestId),
            style: OutlinedButton.styleFrom(
              foregroundColor: cs.outline,
              side: BorderSide(color: cs.outlineVariant),
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              minimumSize: Size(0, 32.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            child: Text(
              'Từ chối',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
