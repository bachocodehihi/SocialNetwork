import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/home/home_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/widgets/banner/network.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/pages/main/user/user_controller.dart';
import 'package:socialnetwork/app/widgets/banner/delete.dart';

class HomeUserView extends StatefulWidget {
  const HomeUserView({super.key});

  @override
  State<HomeUserView> createState() => _HomeUserViewState();
}

class _HomeUserViewState extends State<HomeUserView> {
  late HomeUserController controller;

  @override
  void initState() {
    super.initState();
    controller = HomeUserController();
    controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  final List<Map<String, String>> _stories = const [
    {'name': 'You', 'avatar': 'Y'},
    {'name': 'Anna', 'avatar': 'A'},
    {'name': 'Lucas', 'avatar': 'L'},
    {'name': 'Mia', 'avatar': 'M'},
    {'name': 'David', 'avatar': 'D'},
  ];

  String _formatTimeAgo(String? dateTimeStr) {
    if (dateTimeStr == null) return '';
    try {
      final date = DateTime.parse(dateTimeStr).toLocal();
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inDays > 7) {
        return '${date.day} - ${date.month} - ${date.year}';
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
                    child: Image.network(images[1], fit: BoxFit.cover, width: double.infinity, height: double.infinity),
                  ),
                ),
                SizedBox(height: 8.h),
                Expanded(
                  child: Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.only(
                            bottomRight: Radius.circular(12.r),
                          ),
                          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Image.network(images[2], fit: BoxFit.cover, width: double.infinity, height: double.infinity),
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
                                fontSize: 15.sp,
                                fontWeight: FontWeight.w500,
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
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
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
                                                      fontSize: 12.sp,
                                                      fontWeight: FontWeight.w500,
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
                                                        hasLiked ? Icons.thumb_up_alt_outlined : Icons.thumb_up_alt_outlined,
                                                        size: 15.sp,
                                                        color: hasLiked ? Colors.blue : cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                      ),
                                                      if (likesCount > 0) ...[
                                                        SizedBox(width: 4.w),
                                                        Text(
                                                          '$likesCount',
                                                          style: TextStyle(
                                                            fontSize: 12.sp,
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
                                                                color: rHasLiked ? Colors.blue : cs.onSurfaceVariant.withValues(alpha: 0.7),
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
                          Icon(Icons.reply_outlined, size: 16.sp, color: Colors.blue),
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
                            style: TextStyle(fontSize: 15.sp),
                            decoration: InputDecoration(
                              hintText: replyingToCommentId != null ? 'Trả lời bình luận...' : 'Viết bình luận...',
                              hintStyle: TextStyle(color: Colors.grey, fontSize: 15.sp),
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
                                await controller.addComment(post['_id'], text);
                                setModalState(() {});
                              }
                            }
                          },
                          icon: Icon(Icons.send_outlined, color: Colors.blue),
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

  Widget _buildPostCard(Map<String, dynamic> post) {
    final cs = Theme.of(context).colorScheme;
    final author = post['author'] as Map? ?? {};
    final authorName = author['username'] ?? 'Người dùng';
    final authorAvatar = author['avatar'] ?? '';
    final timeStr = _formatTimeAgo(post['createdAt']);
    final isGroupPost = post['postType'] == 'group';
    final group = post['group'] as Map? ?? {};
    final groupName = group['name'] ?? '';

    final hasLiked = post['likes']?.contains(controller.userId) ?? false;

    return Container(
      margin: EdgeInsets.only(bottom: 14.h),
      padding: EdgeInsets.all(14.w),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(14.r),
        boxShadow: [
          BoxShadow(
            color: cs.shadow.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  if (author.isNotEmpty) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => UserPage(userData: Map<String, dynamic>.from(author)),
                      ),
                    );
                  }
                },
                child: CircleAvatar(
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
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            if (author.isNotEmpty) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => UserPage(userData: Map<String, dynamic>.from(author)),
                                ),
                              );
                            }
                          },
                          child: Text(
                            authorName,
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w500,
                              color: cs.onSurface,
                            ),
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
                                color: Colors.blue,
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
                      hasLiked ? Icons.thumb_up_alt_outlined : Icons.thumb_up_alt_outlined,
                      size: 25.sp,
                      color: hasLiked ? Colors.blue : cs.onSurfaceVariant,
                    ),
                    SizedBox(width: 6.w),
                    Text(
                      '${post['likes']?.length ?? 0}',
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
                      Icons.chat_bubble_outline_outlined,
                      size: 25.sp,
                      color: cs.onSurfaceVariant,
                    ),
                    SizedBox(width: 6.w),
                    Text(
                      '${post['comments']?.length ?? 0}',
                      style: TextStyle(
                        fontSize: 13.sp,
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              Icon(Icons.share_outlined, size: 25.sp, color: cs.onSurfaceVariant),
            ],
          ),
        ],
      ),
    );
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
        onRefresh: () => controller.loadFeed(),
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
                    Row(
                      children: [
                        Text(
                          Language.of(context, 'home'),
                          style: TextStyle(
                            fontSize: 20.sp,
                            fontWeight: FontWeight.w500,
                            color: cs.onSurface,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            controller.goToSearch(context);
                          },
                          child: Icon(
                            Icons.search_outlined, 
                            size: 30.sp,
                            color: cs.onSurface,
                          ),
                        ),

                        SizedBox(width: 10.w),

                        GestureDetector(
                          onTap: () {
                            controller.goToScanner(context);
                          },
                          child: Icon(
                            Icons.qr_code_scanner_outlined, 
                            size: 30.sp,
                            color: cs.onSurface,
                          ),
                        ),

                        SizedBox(width: 10.w),

                        // Builder(
                        //   builder: (context) => GestureDetector(
                        //     onTap: () {
                        //       Scaffold.of(context).openDrawer();
                        //     },
                        //     child: Icon(
                        //       Icons.menu_outlined, 
                        //       size: 30.sp,
                        //       color: cs.onSurface,
                        //     ),
                        //   ),
                        // ),

                        GestureDetector(
                          onTap: () {
                            Scaffold.of(context).openDrawer();
                          },
                          child: Icon(
                            Icons.menu_outlined, 
                            size: 30.sp,
                            color: cs.onSurface,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                SizedBox(height: 20.h),

                // Visibility(
                //   visible: controller.isOffline,
                //   child: BannerNetwork(),
                // ),

                Visibility(
                  visible: controller.isOffline,
                  child: Column(
                    children: [
                      BannerNetwork(),
                      SizedBox(height: 20.h),
                    ],
                  ),
                ),

                Consumer<MainUserController>(
                  builder: (context, mainController, _) {
                    if (mainController.isDeleted && mainController.deleteAt != null) {
                      return Column(
                        children: [
                          BannerDelete(
                            deleteAt: mainController.deleteAt!,
                            onCancel: () => mainController.cancelDeletion(context),
                          ),
                          SizedBox(height: 20.h),
                        ],
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),

                // Consumer<MainUserController>(
                //   builder: (context, mainController, _) {
                //     if (mainController.isDeleted && mainController.deleteAt != null) {
                //       return BannerDelete(
                //         deleteAt: mainController.deleteAt!,
                //         onCancel: () => mainController.cancelDeletion(context),
                //       );
                //     }
                //     return const SizedBox.shrink();
                //   },
                // ),

                // SizedBox(height: 20.h),

                GestureDetector(
                  onTap: () {
                    controller.goToPostContent(context);
                  },
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 25.r,
                        backgroundImage: controller.avatar.isNotEmpty
                            ? NetworkImage(controller.avatar)
                            : null,
                        child: controller.avatar.isEmpty
                            ? Icon(
                              Icons.person_outlined, 
                              size: 30.sp
                            )
                            : null,
                      ),
                      
                      SizedBox(width: 10.w),

                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: cs.onSurface, 
                              width: 1.w
                            ),
                            borderRadius: BorderRadius.circular(50.r),
                            color: Colors.transparent,
                          ),
                          child: TextField(
                            enabled: false,
                            decoration: InputDecoration(
                              hintText: Language.of(context, 'what_s_on_your_mind'),
                              hintStyle: TextStyle(
                                fontSize: 15.sp, 
                                color: cs.onSurface
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(
                                vertical: 10.h,
                                horizontal: 15.w,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 20.h),

                SizedBox(
                  height: 90.h,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _stories.length,
                    separatorBuilder: (context, index) => SizedBox(width: 12.w),
                    itemBuilder: (context, index) {
                      final item = _stories[index];
                      return Column(
                        children: [
                          CircleAvatar(
                            radius: 28.r,
                            backgroundColor: cs.primaryContainer,
                            child: Text(
                              item['avatar']!,
                              style: TextStyle(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.w500,
                                color: cs.onPrimaryContainer,
                              ),
                            ),
                          ),
                          SizedBox(height: 6.h),
                          Text(
                            item['name']!,
                            style: TextStyle(fontSize: 12.sp, color: cs.onSurface),
                          ),
                        ],
                      );
                    },
                  ),
                ),
                SizedBox(height: 16.h),
                
                if (controller.isLoadingFeed && controller.posts.isEmpty)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.h),
                      child: const CircularProgressIndicator(),
                    ),
                  )
                else if (controller.posts.isEmpty)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.h),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.feed_outlined, size: 64.sp, color: cs.onSurfaceVariant.withValues(alpha: 0.5)),
                          SizedBox(height: 12.h),
                          Text(
                            'Chưa có bài viết nào',
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w500,
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            'Hãy đăng chia sẻ đầu tiên của bạn!',
                            style: TextStyle(
                              fontSize: 13.sp,
                              color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...controller.posts.map((post) => _buildPostCard(post)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
