import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/user/user_controller.dart';
import 'package:socialnetwork/app/widgets/avatar/fullscreen.dart';
import 'package:socialnetwork/data/enums/friend_status.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/chat/user/user_page.dart';
import 'package:socialnetwork/app/widgets/item/information.dart';

class UserView extends StatefulWidget {
  final Map<String, dynamic>? userData;

  const UserView({super.key, this.userData});

  @override
  State<UserView> createState() => _UserViewState();
}

class _UserViewState extends State<UserView> {
  late UserController controller;

  @override
  void initState() {
    super.initState();
    controller = UserController(user: widget.userData ?? {});
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
    super.dispose();
  }

  void _showRespondDialog() {
    showModalBottomSheet(
      context: context,
      builder: (_) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Accept'),
              onTap: () async {
                await controller.acceptRequest();
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('Reject'),
              onTap: () async {
                await controller.rejectRequest();
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

  void _showFriendOptions() {
    showModalBottomSheet(
      context: context,
      builder: (_) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Cancel'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Unfriend'),
              onTap: () async {
                await controller.unfriend();
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

  void _showRequestedOptions() {
    showModalBottomSheet(
      context: context,
      builder: (_) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Cancel'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Cancel request'),
              onTap: () async {
                await controller.cancelFriendRequest();
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

  String _formatTimeAgo(String? dateTimeStr) {
    if (dateTimeStr == null) return '';
    try {
      final date = DateTime.parse(dateTimeStr).toLocal();
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inDays > 7) {
        return '${date.day}/${date.month}/${date.year}';
      } else if (diff.inDays >= 1) {
        return '${diff.inDays}d ago';
      } else if (diff.inHours >= 1) {
        return '${diff.inHours}h ago';
      } else if (diff.inMinutes >= 1) {
        return '${diff.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return '';
    }
  }

  Widget _buildPostImages(List<dynamic> images) {
    if (images.isEmpty) return const SizedBox.shrink();

    final cs = Theme.of(context).colorScheme;

    if (images.length == 1) {
      return Container(
        margin: EdgeInsets.only(top: 8.h),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Image.network(
          images[0],
          fit: BoxFit.cover,
          width: double.infinity,
          errorBuilder: (context, error, stackTrace) => Container(
            height: 150.h,
            color: cs.surfaceContainerHighest,
            child: Icon(Icons.broken_image_outlined, color: cs.onSurfaceVariant),
          ),
        ),
      );
    }

    if (images.length == 2) {
      return Container(
        margin: EdgeInsets.only(top: 8.h),
        height: 150.h,
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
                ),
                clipBehavior: Clip.antiAlias,
                child: Image.network(images[0], fit: BoxFit.cover, height: double.infinity),
              ),
            ),
            SizedBox(width: 8.w),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
                ),
                clipBehavior: Clip.antiAlias,
                child: Image.network(images[1], fit: BoxFit.cover, height: double.infinity),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      margin: EdgeInsets.only(top: 8.h),
      height: 180.h,
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(12.r),
                  bottomLeft: Radius.circular(12.r),
                ),
                border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.network(images[0], fit: BoxFit.cover, height: double.infinity),
            ),
          ),
          SizedBox(width: 8.w),
          Expanded(
            flex: 1,
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.only(
                        topRight: Radius.circular(12.r),
                      ),
                      border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Image.network(images[1], fit: BoxFit.cover, height: double.infinity),
                  ),
                ),
                SizedBox(height: 8.h),
                Expanded(
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.only(
                            bottomRight: Radius.circular(12.r),
                          ),
                          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Image.network(images[2], fit: BoxFit.cover, height: double.infinity),
                      ),
                      if (images.length > 3)
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.only(
                              bottomRight: Radius.circular(12.r),
                            ),
                          ),
                          child: Center(
                            child: Text(
                              '+${images.length - 3}',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPostItem(Map<String, dynamic> post) {
    final cs = Theme.of(context).colorScheme;
    final author = post['author'] as Map? ?? {};
    final authorName = author['username'] ?? 'Người dùng';
    final authorAvatar = author['avatar'] ?? '';
    final timeStr = _formatTimeAgo(post['createdAt']);

    final likes = post['likes'] as List? ?? [];
    final currentUserId = controller.userId;
    final hasLiked = likes.contains(currentUserId);

    final isGroupPost = post['postType'] == 'group';
    final group = post['group'] as Map? ?? {};
    final groupName = group['name'] ?? '';

    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: cs.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18.r,
                backgroundImage: authorAvatar.isNotEmpty ? NetworkImage(authorAvatar) : null,
                child: authorAvatar.isEmpty
                    ? Text(
                        authorName.substring(0, 1).toUpperCase(),
                        style: TextStyle(
                          color: cs.onPrimaryContainer,
                          fontWeight: FontWeight.w500,
                        ),
                      )
                    : null,
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          authorName,
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w500,
                            color: cs.onSurface,
                          ),
                        ),
                        if (isGroupPost && groupName.isNotEmpty) ...[
                          SizedBox(width: 6.w),
                          Icon(Icons.arrow_right_rounded, size: 16.sp, color: cs.onSurfaceVariant),
                          SizedBox(width: 4.w),
                          Expanded(
                            child: Text(
                              groupName,
                              style: TextStyle(
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w500,
                                color: cs.primary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      timeStr,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.more_horiz_rounded, color: cs.onSurfaceVariant),
            ],
          ),
          SizedBox(height: 12.h),
          Text(
            post['content'] ?? '',
            style: TextStyle(
              fontSize: 14.sp,
              color: cs.onSurface.withValues(alpha: 0.9),
              height: 1.3,
            ),
          ),
          
          _buildPostImages(post['images'] as List? ?? []),

          SizedBox(height: 12.h),
          Divider(height: 1, color: cs.outlineVariant.withValues(alpha: 0.5)),
          SizedBox(height: 10.h),
          Row(
            children: [
              GestureDetector(
                onTap: () => controller.likePost(post['_id']),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    Icon(
                      hasLiked ? Icons.thumb_up : Icons.thumb_up_alt_outlined,
                      size: 20.sp,
                      color: hasLiked ? Colors.blue : cs.onSurfaceVariant,
                    ),
                    SizedBox(width: 6.w),
                    Text(
                      '${likes.length}',
                      style: TextStyle(
                        fontSize: 13.sp,
                        color: hasLiked ? Colors.blue : cs.onSurfaceVariant,
                        fontWeight: hasLiked ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 24.w),
              GestureDetector(
                onTap: () => _showCommentBottomSheet(context, post),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 20.sp,
                      color: cs.onSurfaceVariant,
                    ),
                    SizedBox(width: 6.w),
                    Text(
                      '${(post['comments'] as List? ?? []).length}',
                      style: TextStyle(
                        fontSize: 13.sp,
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              Icon(Icons.share_rounded, size: 20.sp, color: cs.onSurfaceVariant),
            ],
          ),
        ],
      ),
    );
  }

  void _showCommentBottomSheet(BuildContext context, Map<String, dynamic> post) {
    final TextEditingController commentTextController = TextEditingController();
    final cs = Theme.of(context).colorScheme;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        String? replyingToCommentId;
        String? replyingToUsername;

        return StatefulBuilder(
          builder: (context, setModalState) {
            final currentPost = controller.posts.firstWhere((p) => p['_id'] == post['_id'], orElse: () => post);
            final comments = currentPost['comments'] as List? ?? [];

            return Container(
              height: MediaQuery.of(context).size.height * 0.7,
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
              ),
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Column(
                children: [
                  Container(
                    width: 40.w,
                    height: 4.h,
                    margin: EdgeInsets.symmetric(vertical: 12.h),
                    decoration: BoxDecoration(
                      color: cs.outlineVariant,
                      borderRadius: BorderRadius.circular(2.r),
                    ),
                  ),
                  Text(
                    'Bình luận',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: cs.onSurface,
                    ),
                  ),
                  Divider(color: cs.outlineVariant),
                  Expanded(
                    child: comments.isEmpty
                        ? Center(
                            child: Text(
                              'Chưa có bình luận nào. Hãy là người đầu tiên!',
                              style: TextStyle(color: Colors.grey, fontSize: 14.sp),
                            ),
                          )
                        : ListView.separated(
                            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                            itemCount: comments.length,
                            separatorBuilder: (context, index) => SizedBox(height: 12.h),
                            itemBuilder: (context, index) {
                              final comment = comments[index];
                              final author = comment['author'] as Map? ?? {};
                              final authorName = author['username'] ?? 'Người dùng';
                              final authorAvatar = author['avatar'] ?? '';

                              final replies = comment['replies'] as List? ?? [];
                              final likesList = comment['likes'] as List? ?? [];
                              final hasLiked = likesList.contains(controller.userId) || comment['hasLiked'] == true;
                              final likesCount = likesList.isNotEmpty ? likesList.length : (comment['likesCount'] as int? ?? 0);
                              final createdAtStr = comment['createdAt']?.toString();
                              final timeAgo = _formatTimeAgo(createdAtStr);

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      CircleAvatar(
                                        radius: 16.r,
                                        backgroundImage: authorAvatar.isNotEmpty
                                            ? NetworkImage(authorAvatar)
                                            : null,
                                        child: authorAvatar.isEmpty
                                            ? Text(
                                                authorName.substring(0, 1).toUpperCase(),
                                                style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w500),
                                              )
                                            : null,
                                      ),
                                      SizedBox(width: 10.w),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              padding: EdgeInsets.all(10.w),
                                              decoration: BoxDecoration(
                                                color: cs.surfaceContainerHighest,
                                                borderRadius: BorderRadius.circular(12.r),
                                              ),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    authorName,
                                                    style: TextStyle(
                                                      fontSize: 12.sp,
                                                      fontWeight: FontWeight.w500,
                                                      color: cs.onSurface,
                                                    ),
                                                  ),
                                                  SizedBox(height: 4.h),
                                                  Text(
                                                    comment['content'] ?? '',
                                                    style: TextStyle(
                                                      fontSize: 13.sp,
                                                      color: cs.onSurfaceVariant,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            SizedBox(height: 4.h),
                                            Row(
                                              children: [
                                                SizedBox(width: 4.w),
                                                Text(
                                                  timeAgo.isNotEmpty ? timeAgo : 'Just now',
                                                  style: TextStyle(
                                                    fontSize: 11.sp,
                                                    color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                  ),
                                                ),
                                                SizedBox(width: 12.w),
                                                GestureDetector(
                                                  onTap: () {
                                                    setModalState(() {
                                                      replyingToCommentId = comment['_id'] ?? index.toString();
                                                      replyingToUsername = authorName;
                                                    });
                                                  },
                                                  child: Text(
                                                    'Trả lời',
                                                    style: TextStyle(
                                                      fontSize: 11.sp,
                                                      fontWeight: FontWeight.w600,
                                                      color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                    ),
                                                  ),
                                                ),
                                                SizedBox(width: 12.w),
                                                GestureDetector(
                                                  onTap: () {
                                                    setModalState(() {
                                                      comment['hasLiked'] = !hasLiked;
                                                      comment['likesCount'] = likesCount + (hasLiked ? -1 : 1);
                                                    });
                                                    controller.likeComment(post['_id'], comment['_id'] ?? '');
                                                  },
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Icon(
                                                        hasLiked ? Icons.thumb_up_alt : Icons.thumb_up_alt_outlined,
                                                        size: 13.sp,
                                                        color: hasLiked ? cs.primary : cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                      ),
                                                      if (likesCount > 0) ...[
                                                        SizedBox(width: 4.w),
                                                        Text(
                                                          '$likesCount',
                                                          style: TextStyle(
                                                            fontSize: 11.sp,
                                                            color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                          ),
                                                        ),
                                                      ],
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  
                                  // Nested replies
                                  if (replies.isNotEmpty)
                                    Padding(
                                      padding: EdgeInsets.only(left: 42.w, top: 8.h),
                                      child: ListView.separated(
                                        shrinkWrap: true,
                                        physics: const NeverScrollableScrollPhysics(),
                                        itemCount: replies.length,
                                        separatorBuilder: (context, _) => SizedBox(height: 8.h),
                                        itemBuilder: (context, rIndex) {
                                          final reply = replies[rIndex];
                                          final rAuthor = reply['author'] as Map? ?? {};
                                          final rAuthorName = rAuthor['username'] ?? 'Người dùng';
                                          final rAuthorAvatar = rAuthor['avatar'] ?? '';
                                          final rCreatedAtStr = reply['createdAt']?.toString();
                                          final rTimeAgo = _formatTimeAgo(rCreatedAtStr);
                                          final rLikesList = reply['likes'] as List? ?? [];
                                          final rHasLiked = rLikesList.contains(controller.userId) || reply['hasLiked'] == true;
                                          final rLikesCount = rLikesList.isNotEmpty ? rLikesList.length : (reply['likesCount'] as int? ?? 0);

                                          return Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              CircleAvatar(
                                                radius: 12.r,
                                                backgroundImage: rAuthorAvatar.isNotEmpty
                                                    ? NetworkImage(rAuthorAvatar)
                                                    : null,
                                                child: rAuthorAvatar.isEmpty
                                                    ? Text(
                                                        rAuthorName.substring(0, 1).toUpperCase(),
                                                        style: TextStyle(fontSize: 9.sp, fontWeight: FontWeight.w500),
                                                      )
                                                    : null,
                                              ),
                                              SizedBox(width: 8.w),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                   children: [
                                                     Container(
                                                      padding: EdgeInsets.all(8.w),
                                                      decoration: BoxDecoration(
                                                        color: cs.surfaceContainerHighest.withValues(alpha: 0.6),
                                                        borderRadius: BorderRadius.circular(10.r),
                                                      ),
                                                      child: Column(
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        children: [
                                                          Text(
                                                            rAuthorName,
                                                            style: TextStyle(
                                                              fontSize: 11.sp,
                                                              fontWeight: FontWeight.w500,
                                                              color: cs.onSurface,
                                                            ),
                                                          ),
                                                          SizedBox(height: 2.h),
                                                          Text(
                                                            reply['content'] ?? '',
                                                            style: TextStyle(
                                                              fontSize: 12.sp,
                                                              color: cs.onSurfaceVariant,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    SizedBox(height: 2.h),
                                                    Row(
                                                      children: [
                                                        SizedBox(width: 4.w),
                                                        Text(
                                                          rTimeAgo.isNotEmpty ? rTimeAgo : 'Just now',
                                                          style: TextStyle(
                                                            fontSize: 10.sp,
                                                            color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                          ),
                                                        ),
                                                        SizedBox(width: 12.w),
                                                        GestureDetector(
                                                          onTap: () {
                                                            setModalState(() {
                                                              reply['hasLiked'] = !rHasLiked;
                                                              reply['likesCount'] = rLikesCount + (rHasLiked ? -1 : 1);
                                                            });
                                                            controller.likeReply(post['_id'], comment['_id'] ?? '', reply['_id'] ?? '');
                                                          },
                                                          child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            children: [
                                                              Icon(
                                                                rHasLiked ? Icons.thumb_up_alt : Icons.thumb_up_alt_outlined,
                                                                size: 12.sp,
                                                                color: rHasLiked ? cs.primary : cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                              ),
                                                              if (rLikesCount > 0) ...[
                                                                SizedBox(width: 4.w),
                                                                Text(
                                                                  '$rLikesCount',
                                                                  style: TextStyle(
                                                                    fontSize: 10.sp,
                                                                    color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                                  ),
                                                                ),
                                                              ],
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      ),
                                    ),
                                ],
                              );
                            },
                          ),
                  ),
                  if (replyingToCommentId != null)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                      color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                      child: Row(
                        children: [
                          Icon(Icons.reply, size: 16.sp, color: cs.primary),
                          SizedBox(width: 8.w),
                          Expanded(
                            child: Text(
                              'Đang trả lời $replyingToUsername',
                              style: TextStyle(
                                fontSize: 13.sp,
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              setModalState(() {
                                replyingToCommentId = null;
                                replyingToUsername = null;
                              });
                            },
                            child: Icon(Icons.close, size: 16.sp, color: cs.onSurfaceVariant),
                          ),
                        ],
                      ),
                    ),
                  Divider(color: cs.outlineVariant, height: 1),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    color: cs.surface,
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: commentTextController,
                            style: TextStyle(fontSize: 14.sp),
                            decoration: InputDecoration(
                              hintText: replyingToCommentId != null ? 'Trả lời bình luận...' : 'Viết bình luận...',
                              hintStyle: TextStyle(color: Colors.grey, fontSize: 14.sp),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24.r),
                                borderSide: BorderSide(color: cs.outlineVariant),
                              ),
                              contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                            ),
                          ),
                        ),
                        SizedBox(width: 8.w),
                        IconButton(
                          onPressed: () async {
                            final text = commentTextController.text.trim();
                            if (text.isNotEmpty) {
                              commentTextController.clear();
                              if (replyingToCommentId != null) {
                                await controller.addReply(post['_id'], replyingToCommentId!, text);
                                setModalState(() {
                                  replyingToCommentId = null;
                                  replyingToUsername = null;
                                });
                              } else {
                                await controller.commentPost(post['_id'], text);
                                setModalState(() {});
                              }
                            }
                          },
                          icon: Icon(Icons.send_rounded, color: cs.primary),
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
    );
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness:
          brightness == Brightness.dark ? Brightness.light : Brightness.dark,
    ));

    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: SingleChildScrollView(
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
                      child: Icon(Icons.arrow_back_ios_outlined,
                          size: 20.sp, 
                          color: cs.onSurface
                        ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {
                          if (controller.avatar.isNotEmpty) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => AvatarFullScreen(imageUrl: controller.avatar),
                              ),
                            );
                          }
                        },
                        child: Hero(
                          tag: 'user_avatar_${controller.userId}',
                          child: CircleAvatar(
                            radius: 50.r,
                            backgroundColor: cs.surfaceContainerHighest,
                            backgroundImage: controller.avatarUrl.isNotEmpty
                                ? NetworkImage(controller.avatarUrl)
                                : null,
                            child: controller.avatarUrl.isEmpty
                                ? Icon(Icons.person_outline, 
                                    size: 50.r, color: cs.onSurfaceVariant)
                                : null,
                          ),
                        ),
                      ),
                      SizedBox(height: 10.h),
                      Text(
                        controller.username,
                        style: TextStyle(
                          color: cs.onSurface,
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 20.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        controller.friendsCount.toString(),
                        'Friends',
                        onTap: () {
                        },
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        controller.followersCount.toString(), 
                        'Followers', 
                        onTap: () {
                        },
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        controller.followingCount.toString(), 
                        'Following', 
                        onTap: () {
                        },
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        controller.postCount.toString(),
                        'Posts', 
                        onTap: () {

                        },
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: ListenableBuilder(
                        listenable: controller,
                        builder: (context, _) {
                          switch (controller.status) {
                            case FriendStatus.none:
                              return ElevatedButton(
                                onPressed: controller.sendFriendRequest,
                                child: const Text('Add friend'),
                              );

                            case FriendStatus.requested:
                              return ElevatedButton(
                                onPressed: () => _showRequestedOptions(),
                                child: const Text('Requested'),
                              );

                            case FriendStatus.received:
                              return ElevatedButton(
                                onPressed: () => _showRespondDialog(),
                                child: const Text('Respond'),
                              );

                            case FriendStatus.friend:
                              return ElevatedButton(
                                onPressed: () => _showFriendOptions(),
                                child: const Text('Friend'),
                              );
                          }
                        },
                      ),
                    ),
                    SizedBox(width: 10.w),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ChatUserPage(
                                receiverId: controller.userId,
                                receiverName: controller.username,
                                receiverAvatar: controller.avatarUrl,
                                isFriend: controller.status == FriendStatus.friend,
                              ),
                            ),
                          );
                        },
                        icon: Icon(
                          Icons.message_outlined, 
                          size: 20.sp
                        ),
                        label: Text(
                          'Message',
                          style: TextStyle(
                            fontSize: 15.sp,
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey,
                          foregroundColor: Colors.white,
                          minimumSize: Size.fromHeight(44.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ).copyWith(
                          overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
                Text(
                  'Information',
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),
                SizedBox(height: 20.h),
                if (controller.birthday.isNotEmpty)
                  InformationItem(
                    value: controller.birthday, 
                    title: 'Birthday', 
                    icon: Icons.cake_outlined,
                  ),

                if (controller.gender.isNotEmpty)
                  InformationItem(
                    value: controller.gender,
                    title: 'Gender',
                    icon: Icons.wc_outlined,
                  ),

                if (controller.email.isNotEmpty)
                  InformationItem(
                    value: controller.email,
                    title: 'Email',
                    icon: Icons.email_outlined,
                  ),

                if (controller.address.isNotEmpty)
                  InformationItem(
                    value: controller.address,
                    title: 'Address',
                    icon: Icons.location_on_outlined,
                  ),

                if (controller.phone.isNotEmpty)
                  InformationItem(
                    value: controller.phone,
                    title: 'Phone',
                    icon: Icons.phone_outlined,
                  ),

                if (controller.job.isNotEmpty)
                  InformationItem(
                    value: controller.job,
                    title: 'Job',
                    icon: Icons.work_outline_outlined,
                  ),

                SizedBox(height: 20.h),
                Text(
                  'All posts',
                  style: TextStyle(
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),
                SizedBox(height: 12.h),

                if (controller.loadingPosts)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (controller.posts.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 30),
                      child: Text(
                        'No posts yet.',
                        style: TextStyle(color: Colors.grey, fontSize: 14.sp),
                      ),
                    ),
                  )
                else
                  Column(
                    children: controller.posts.map((post) => _buildPostItem(post)).toList(),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(
    String value, 
    String label, 
    {VoidCallback? onTap,
  }) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: cs.onSurface,
              fontWeight: FontWeight.w500,
              fontSize: 15.sp,
            ),
          ),
          SizedBox(height: 2.h),
          Text(
            label,
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
