import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/app/pages/post/content/group/group_page.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class GroupController extends ChangeNotifier {
  final String groupId;
  late final GroupUsecase _groupUsecase;
  late final ContentUsecase _contentUsecase;

  Map<String, dynamic> _group = {};
  bool loadingGroup = false;

  List<Map<String, dynamic>> posts = [];
  bool loadingPosts = false;

  Map<String, dynamic>? currentUser;

  GroupController({
    required this.groupId,
    GroupUsecase? groupUsecase,
    ContentUsecase? contentUsecase,
  }) {
    final dio = DioClient.createDio();
    _groupUsecase = groupUsecase ??
        GroupUsecase(
          GroupRepositoryImp(
            GroupApi(dio),
          ),
        );

    _contentUsecase = contentUsecase ??
        ContentUsecase(
          ContentRepositoryImp(
            ContentApi(dio),
          ),
        );

    loadCurrentUser();
    loadGroupDetails();
    loadGroupPosts();
  }

  Map<String, dynamic> get group => _group;
  String get groupName => _group['name'] ?? 'Group Chat';
  String get groupAvatar => _group['avatar'] ?? '';
  String get groupDescription => _group['description'] ?? '';
  
  int get membersCount => (_group['members'] as List? ?? []).length;
  int get postCount => _group['postCount'] as int? ?? posts.length;

  String get avatar => currentUser?['avatar'] ?? '';

  Future<void> loadCurrentUser() async {
    try {
      currentUser = await AuthLocal.getCurrentUser();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> loadGroupDetails() async {
    loadingGroup = true;
    notifyListeners();
    try {
      final res = await _groupUsecase.getGroupById(groupId);
      _group = res;
    } catch (_) {}
    loadingGroup = false;
    notifyListeners();
  }

  Future<void> loadGroupPosts() async {
    loadingPosts = true;
    notifyListeners();
    try {
      posts = await _contentUsecase.getGroupPosts(groupId);
    } catch (_) {
      posts = [];
    } finally {
      loadingPosts = false;
      notifyListeners();
    }
  }

  Future<void> likePost(String postId) async {
    try {
      final res = await _contentUsecase.likePost(postId);
      final updatedPost = res['post'] ?? res;
      final idx = posts.indexWhere((p) => p['_id'] == postId);
      if (idx != -1) {
        posts[idx] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  String get userId => currentUser?['_id'] ?? '';

  Future<void> commentPost(String postId, String content) async {
    try {
      final res = await _contentUsecase.commentPost(postId, content);
      final updatedPost = res['post'] ?? res;
      final idx = posts.indexWhere((p) => p['_id'] == postId);
      if (idx != -1) {
        posts[idx] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> addComment(String postId, String content) async {
    try {
      final res = await _contentUsecase.commentPost(postId, content);
      final updatedPost = res['post'] ?? res;
      final idx = posts.indexWhere((p) => p['_id'] == postId);
      if (idx != -1) {
        posts[idx] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> likeComment(String postId, String commentId) async {
    try {
      final postIndex = posts.indexWhere((p) => p['_id'] == postId);
      if (postIndex != -1) {
        final post = posts[postIndex];
        final List<dynamic> commentsList = List.from(post['comments'] ?? []);
        final commentIndex = commentsList.indexWhere((c) => c['_id'] == commentId);
        if (commentIndex != -1) {
          final comment = Map<String, dynamic>.from(commentsList[commentIndex]);
          final List<dynamic> likes = List.from(comment['likes'] ?? []);
          final currentUserId = userId;
          if (likes.contains(currentUserId)) {
            likes.remove(currentUserId);
          } else {
            likes.add(currentUserId);
          }
          comment['likes'] = likes;
          comment['hasLiked'] = likes.contains(currentUserId);
          comment['likesCount'] = likes.length;
          commentsList[commentIndex] = comment;
          post['comments'] = commentsList;
          notifyListeners();
        }
      }

      final result = await _contentUsecase.likeComment(commentId);
      final updatedPost = result['post'] ?? result;
      if (postIndex != -1) {
        posts[postIndex] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> likeReply(String postId, String commentId, String replyId) async {
    try {
      final postIndex = posts.indexWhere((p) => p['_id'] == postId);
      if (postIndex != -1) {
        final post = posts[postIndex];
        final List<dynamic> commentsList = List.from(post['comments'] ?? []);
        final commentIndex = commentsList.indexWhere((c) => c['_id'] == commentId);
        if (commentIndex != -1) {
          final comment = Map<String, dynamic>.from(commentsList[commentIndex]);
          final List<dynamic> repliesList = List.from(comment['replies'] ?? []);
          final replyIndex = repliesList.indexWhere((r) => r['_id'] == replyId);
          if (replyIndex != -1) {
            final reply = Map<String, dynamic>.from(repliesList[replyIndex]);
            final List<dynamic> likes = List.from(reply['likes'] ?? []);
            final currentUserId = userId;
            if (likes.contains(currentUserId)) {
              likes.remove(currentUserId);
            } else {
              likes.add(currentUserId);
            }
            reply['likes'] = likes;
            reply['hasLiked'] = likes.contains(currentUserId);
            reply['likesCount'] = likes.length;
            repliesList[replyIndex] = reply;
            comment['replies'] = repliesList;
            commentsList[commentIndex] = comment;
            post['comments'] = commentsList;
            notifyListeners();
          }
        }
      }

      final result = await _contentUsecase.likeReply(commentId, replyId);
      final updatedPost = result['post'] ?? result;
      if (postIndex != -1) {
        posts[postIndex] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> addReply(String postId, String commentId, String content) async {
    try {
      final result = await _contentUsecase.replyComment(postId, commentId, content);
      final updatedPost = result['post'] ?? result;
      final idx = posts.indexWhere((p) => p['_id'] == postId);
      if (idx != -1) {
        posts[idx] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  void goToPostContent(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => GroupPostContentPage(
          groupId: groupId,
          groupName: groupName,
        ),
      ),
    ).then((result) {
      if (result == true) {
        loadGroupPosts();
        loadGroupDetails();
      }
    });
  }

  Future<void> goToMember(BuildContext context) async {
    Navigator.pushNamed(context, Routes.member, arguments: groupId);
  }
}
