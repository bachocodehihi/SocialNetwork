import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/avatar/fullscreen.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class ContentView extends StatefulWidget {
  final Map<String, dynamic> post;

  const ContentView({super.key, required this.post});

  @override
  State<ContentView> createState() => _ContentViewState();
}

class _ContentViewState extends State<ContentView> {
  final ContentUsecase _contentUsecase = ContentUsecase(
    ContentRepositoryImp(
      ContentApi(DioClient.createDio()),
    ),
  );

  String? _currentUserId;
  Map<String, dynamic>? _postState;

  @override
  void initState() {
    super.initState();
    _postState = Map<String, dynamic>.from(widget.post);
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await AuthLocal.getCurrentUser();
    if (mounted) {
      setState(() {
        _currentUserId = user?['_id'] ?? '';
      });
    }
  }

  Future<void> _likePost() async {
    if (_postState == null) return;
    final postId = _postState!['_id'] ?? '';
    try {
      setState(() {
        final List<dynamic> likes = List.from(_postState!['likes'] ?? []);
        if (likes.contains(_currentUserId)) {
          likes.remove(_currentUserId);
        } else {
          if (_currentUserId != null && _currentUserId!.isNotEmpty) {
            likes.add(_currentUserId);
          }
        }
        _postState!['likes'] = likes;
      });

      final result = await _contentUsecase.likePost(postId);
      if (result.containsKey('post')) {
        setState(() {
          _postState = result['post'];
        });
      }
    } catch (e) {
      debugPrint('Error liking post: $e');
    }
  }

  Future<void> _addComment(String text) async {
    if (_postState == null) return;
    final postId = _postState!['_id'] ?? '';
    try {
      final result = await _contentUsecase.commentPost(postId, text);
      if (result.containsKey('post')) {
        setState(() {
          _postState = result['post'];
        });
      }
    } catch (e) {
      debugPrint('Error adding comment: $e');
    }
  }

  Future<void> _likeComment(String commentId) async {
    if (_postState == null) return;
    try {
      final result = await _contentUsecase.likeComment(commentId);
      if (result.containsKey('post')) {
        setState(() {
          _postState = result['post'];
        });
      }
    } catch (e) {
      debugPrint('Error liking comment: $e');
    }
  }

  Future<void> _likeReply(String commentId, String replyId) async {
    if (_postState == null) return;
    try {
      final result = await _contentUsecase.likeReply(commentId, replyId);
      if (result.containsKey('post')) {
        setState(() {
          _postState = result['post'];
        });
      }
    } catch (e) {
      debugPrint('Error liking reply: $e');
    }
  }

  Future<void> _addReply(String commentId, String text) async {
    if (_postState == null) return;
    final postId = _postState!['_id'] ?? '';
    try {
      final result = await _contentUsecase.replyComment(postId, commentId, text);
      if (result.containsKey('post')) {
        setState(() {
          _postState = result['post'];
        });
      }
    } catch (e) {
      debugPrint('Error adding reply: $e');
    }
  }

  int _getCommentsCount(Map<String, dynamic> post) {
    final comments = post['comments'] as List? ?? [];
    int count = comments.length;
    for (final comment in comments) {
      if (comment is Map) {
        final replies = comment['replies'] as List? ?? [];
        count += replies.length;
      }
    }
    return count;
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

  void _showCommentBottomSheet(BuildContext context, Map<String, dynamic> post) {
    final TextEditingController commentTextController = TextEditingController();
    final cs = Theme.of(context).colorScheme;
    String? replyingToCommentId;
    String? replyingToUsername;
    final Set<String> expandedCommentIds = {};
    final Map<String, int> visibleRepliesCount = {};

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final comments = _postState?['comments'] as List? ?? [];

            return GestureDetector(
              onTap: () => FocusScope.of(context).unfocus(),
              child: Container(
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
                                final hasLiked = likesList.contains(_currentUserId) || comment['hasLiked'] == true;
                                final likesCount = likesList.isNotEmpty ? likesList.length : (comment['likesCount'] as int? ?? 0);
                                final createdAtStr = comment['createdAt']?.toString();
                                final timeAgo = _formatTimeAgo(createdAtStr);

                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
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
                                                          fontSize: 12.sp,
                                                          fontWeight: FontWeight.w500,
                                                          color: cs.onSurface,
                                                        ),
                                                      ),
                                                    ),
                                                    SizedBox(height: 4.h),
                                                    Text(
                                                      comment['content'] ?? '',
                                                      textAlign: TextAlign.justify,
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
                                                    onTap: () async {
                                                      setModalState(() {
                                                        comment['hasLiked'] = !hasLiked;
                                                        comment['likesCount'] = likesCount + (hasLiked ? -1 : 1);
                                                      });
                                                      await _likeComment(comment['_id'] ?? '');
                                                      setModalState(() {});
                                                    },
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Icon(
                                                          hasLiked ? Icons.thumb_up_alt : Icons.thumb_up_alt_outlined,
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
                                    if (replies.isNotEmpty) ...[
                                      if (!expandedCommentIds.contains(comment['_id'] ?? ''))
                                        GestureDetector(
                                          onTap: () {
                                            setModalState(() {
                                              final commentId = comment['_id'] ?? '';
                                              expandedCommentIds.add(commentId);
                                              visibleRepliesCount[commentId] = 10;
                                            });
                                          },
                                          child: Padding(
                                            padding: EdgeInsets.only(left: 42.w, top: 4.h, bottom: 4.h),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.keyboard_arrow_down,
                                                  size: 16.sp,
                                                  color: Colors.grey,
                                                ),
                                                SizedBox(width: 4.w),
                                                Text(
                                                  'Xem ${replies.length} phản hồi',
                                                  style: TextStyle(
                                                    fontSize: 12.sp,
                                                    fontWeight: FontWeight.w500,
                                                    color: Colors.grey,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      if (expandedCommentIds.contains(comment['_id'] ?? ''))
                                        Padding(
                                          padding: EdgeInsets.only(left: 42.w, top: 8.h),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              ListView.separated(
                                                shrinkWrap: true,
                                                physics: const NeverScrollableScrollPhysics(),
                                                itemCount: (visibleRepliesCount[comment['_id']] ?? 10) < replies.length ? (visibleRepliesCount[comment['_id']] ?? 10) : replies.length,
                                                separatorBuilder: (context, _) => SizedBox(height: 8.h),
                                                itemBuilder: (context, rIndex) {
                                                  final reply = replies[rIndex];
                                                  final rAuthor = reply['author'] as Map? ?? {};
                                                  final rAuthorName = rAuthor['username'] ?? 'Người dùng';
                                                  final rAuthorAvatar = rAuthor['avatar'] ?? '';
                                                  final rCreatedAtStr = reply['createdAt']?.toString();
                                                  final rTimeAgo = _formatTimeAgo(rCreatedAtStr);
                                                  final rLikesList = reply['likes'] as List? ?? [];
                                                  final rHasLiked = rLikesList.contains(_currentUserId) || reply['hasLiked'] == true;
                                                  final rLikesCount = rLikesList.isNotEmpty ? rLikesList.length : (reply['likesCount'] as int? ?? 0);

                                                  return Row(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      GestureDetector(
                                                        onTap: () {
                                                          if (rAuthor.isNotEmpty) {
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (_) => UserPage(userData: Map<String, dynamic>.from(rAuthor)),
                                                              ),
                                                            );
                                                          }
                                                        },
                                                        child: CircleAvatar(
                                                          radius: 16.r,
                                                          backgroundImage: rAuthorAvatar.isNotEmpty
                                                              ? NetworkImage(rAuthorAvatar)
                                                              : null,
                                                          child: rAuthorAvatar.isEmpty
                                                              ? Text(
                                                                  rAuthorName.substring(0, 1).toUpperCase(),
                                                                  style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w500),
                                                                )
                                                              : null,
                                                        ),
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
                                                                  GestureDetector(
                                                                    onTap: () {
                                                                      if (rAuthor.isNotEmpty) {
                                                                        Navigator.push(
                                                                          context,
                                                                          MaterialPageRoute(
                                                                            builder: (_) => UserPage(userData: Map<String, dynamic>.from(rAuthor)),
                                                                          ),
                                                                        );
                                                                      }
                                                                    },
                                                                    child: Text(
                                                                      rAuthorName,
                                                                      style: TextStyle(
                                                                        fontSize: 12.sp,
                                                                        fontWeight: FontWeight.w500,
                                                                        color: cs.onSurface,
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  SizedBox(height: 2.h),
                                                                  Text(
                                                                    reply['content'] ?? '',
                                                                    textAlign: TextAlign.justify,
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
                                                                      replyingToCommentId = comment['_id'] ?? index.toString();
                                                                      replyingToUsername = rAuthorName;
                                                                    });
                                                                  },
                                                                  child: Text(
                                                                    'Trả lời',
                                                                    style: TextStyle(
                                                                      fontSize: 10.sp,
                                                                      fontWeight: FontWeight.w500,
                                                                      color: cs.onSurfaceVariant.withValues(alpha: 0.7),
                                                                    ),
                                                                  ),
                                                                ),
                                                                SizedBox(width: 12.w),
                                                                GestureDetector(
                                                                  onTap: () async {
                                                                    setModalState(() {
                                                                      reply['hasLiked'] = !rHasLiked;
                                                                      reply['likesCount'] = rLikesCount + (rHasLiked ? -1 : 1);
                                                                    });
                                                                    await _likeReply(comment['_id'] ?? '', reply['_id'] ?? '');
                                                                    setModalState(() {});
                                                                  },
                                                                  child: Row(
                                                                    mainAxisSize: MainAxisSize.min,
                                                                    children: [
                                                                      Icon(
                                                                        rHasLiked ? Icons.thumb_up_alt : Icons.thumb_up_alt_outlined,
                                                                        size: 15.sp,
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
                                              SizedBox(height: 8.h),
                                              Row(
                                                children: [
                                                  if ((visibleRepliesCount[comment['_id']] ?? 10) < replies.length) ...[
                                                    GestureDetector(
                                                      onTap: () {
                                                        setModalState(() {
                                                          final commentId = comment['_id'] ?? '';
                                                          visibleRepliesCount[commentId] = (visibleRepliesCount[commentId] ?? 10) + 10;
                                                        });
                                                      },
                                                      child: Padding(
                                                        padding: EdgeInsets.symmetric(vertical: 4.h),
                                                        child: Row(
                                                          mainAxisSize: MainAxisSize.min,
                                                          children: [
                                                            Icon(Icons.more_horiz_outlined, size: 16.sp, color: Colors.grey),
                                                            SizedBox(width: 4.w),
                                                            Text(
                                                              'Xem thêm phản hồi',
                                                              style: TextStyle(
                                                                fontSize: 12.sp,
                                                                fontWeight: FontWeight.w500,
                                                                color: Colors.grey,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                    SizedBox(width: 16.w),
                                                  ],
                                                  GestureDetector(
                                                    onTap: () {
                                                      setModalState(() {
                                                        final commentId = comment['_id'] ?? '';
                                                        expandedCommentIds.remove(commentId);
                                                      });
                                                    },
                                                    child: Padding(
                                                      padding: EdgeInsets.symmetric(vertical: 4.h),
                                                      child: Row(
                                                        mainAxisSize: MainAxisSize.min,
                                                        children: [
                                                          Icon(Icons.keyboard_arrow_up_outlined, size: 16.sp, color: Colors.grey),
                                                          SizedBox(width: 4.w),
                                                          Text(
                                                            'Ẩn phản hồi',
                                                            style: TextStyle(
                                                              fontSize: 12.sp,
                                                              fontWeight: FontWeight.w500,
                                                              color: Colors.grey,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                    ],
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
                            Text(
                              'Đang trả lời $replyingToUsername',
                              style: TextStyle(fontSize: 12.sp, color: Colors.grey),
                            ),
                            const Spacer(),
                            GestureDetector(
                              onTap: () {
                                setModalState(() {
                                  replyingToCommentId = null;
                                  replyingToUsername = null;
                                });
                              },
                              child: Icon(Icons.close_rounded, size: 16.sp, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    Divider(height: 1, color: cs.outlineVariant),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: commentTextController,
                              minLines: 1,
                              maxLines: 5,
                              textAlign: TextAlign.justify,
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
                                  final targetCommentId = replyingToCommentId!;
                                  await _addReply(targetCommentId, text);
                                  setModalState(() {
                                    expandedCommentIds.add(targetCommentId);
                                    visibleRepliesCount[targetCommentId] = 9999;
                                    replyingToCommentId = null;
                                    replyingToUsername = null;
                                  });
                                } else {
                                  await _addComment(text);
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
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_postState == null) return const SizedBox.shrink();

    final cs = Theme.of(context).colorScheme;
    final brightness = Theme.of(context).brightness;

    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness:
          brightness == Brightness.dark ? Brightness.light : Brightness.dark,
    ));

    final author = _postState!['author'] as Map? ?? {};
    final authorName = author['username'] ?? 'Người dùng';
    final authorAvatar = author['avatar'] ?? '';
    final timeStr = _formatTimeAgo(_postState!['createdAt']);
    final contentText = _postState!['content'] ?? '';
    final images = _postState!['images'] as List? ?? [];

    final likes = _postState!['likes'] as List? ?? [];
    final hasLiked = likes.contains(_currentUserId);
    final commentsCount = _getCommentsCount(_postState!);

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context, _postState),
          child: Icon(
            Icons.arrow_back_ios_outlined,
            size: 20.sp,
            color: cs.onSurface,
          ),
        ),
        title: Text(
          'Chi tiết bài viết',
          style: TextStyle(
            color: cs.onSurface,
            fontSize: 18.sp,
            fontWeight: FontWeight.w500,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
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
                        radius: 20.r,
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
                    SizedBox(width: 12.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
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
                          SizedBox(height: 2.h),
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
                  ],
                ),
                SizedBox(height: 16.h),
                SelectableText(
                  contentText,
                  textAlign: TextAlign.justify,
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface.withValues(alpha: 0.95),
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 16.h),
                if (images.isNotEmpty)
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: images.length,
                    separatorBuilder: (context, index) => SizedBox(height: 12.h),
                    itemBuilder: (context, index) {
                      final imageUrl = images[index].toString();
                      return GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => AvatarFullScreen(
                                imageUrls: List<String>.from(images),
                                initialIndex: index,
                              ),
                            ),
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12.r),
                            border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: Image.network(
                            imageUrl,
                            fit: BoxFit.fitWidth,
                            width: double.infinity,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                height: 200.h,
                                color: cs.surfaceContainerHighest,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) => Container(
                              height: 150.h,
                              color: cs.surfaceContainerHighest,
                              child: Icon(Icons.broken_image_outlined, color: cs.onSurfaceVariant),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                SizedBox(height: 24.h),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: cs.surface,
          border: Border(
            top: BorderSide(color: cs.outlineVariant.withValues(alpha: 0.5), width: 1),
          ),
        ),
        padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
        child: SafeArea(
          child: Row(
            children: [
              GestureDetector(
                onTap: _likePost,
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    Icon(
                      hasLiked ? Icons.thumb_up_alt : Icons.thumb_up_alt_outlined,
                      size: 25.sp,
                      color: hasLiked ? Colors.blue : cs.onSurfaceVariant,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      '${likes.length}',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: hasLiked ? Colors.blue : cs.onSurfaceVariant,
                        fontWeight: hasLiked ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 32.w),
              GestureDetector(
                onTap: () => _showCommentBottomSheet(context, _postState!),
                behavior: HitTestBehavior.opaque,
                child: Row(
                  children: [
                    Icon(
                      Icons.chat_bubble_outline_outlined,
                      size: 25.sp,
                      color: cs.onSurfaceVariant,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      '$commentsCount',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: contentText));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Đã sao chép nội dung bài viết!'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
                child: Icon(
                  Icons.share_outlined,
                  size: 25.sp,
                  color: cs.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
