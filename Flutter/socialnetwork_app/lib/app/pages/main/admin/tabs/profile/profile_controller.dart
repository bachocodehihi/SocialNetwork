import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/data/repositories/account_repository_imp.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';

class ProfileAdminController extends ChangeNotifier {
  Map<String, dynamic>? user;
  List<Map<String, dynamic>> posts = [];
  bool loadingPosts = false;

  late AccountUsecase _accountUsecase;
  late ContentUsecase _contentUsecase;

  ProfileAdminController() {
    final dio = DioClient.createDio();
    _accountUsecase = AccountUsecase(
      AccountRepositoryImp(
        AccountApi(dio),
      ),
    );
    _contentUsecase = ContentUsecase(
      ContentRepositoryImp(
        ContentApi(dio),
      ),
    );
    loadUser();
  }

  Future<void> loadUser() async {
    user = await AuthLocal.getCurrentUser();
    notifyListeners();
    if (user != null && user!['_id'] != null) {
      loadUserPosts(user!['_id']);
    }

    try {
      final freshUser = await _accountUsecase.getProfile();
      user = freshUser;
      await AuthLocal.saveUser(freshUser);
      notifyListeners();
      if (freshUser['_id'] != null) {
        loadUserPosts(freshUser['_id']);
      }
    } catch (_) {}
  }

  Future<void> loadUserPosts(String userId) async {
    loadingPosts = true;
    notifyListeners();
    try {
      posts = await _contentUsecase.getUserPosts(userId);
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

  Future<void> likeComment(String postId, String commentId) async {
    try {
      // Optimistic UI update
      final postIndex = posts.indexWhere((p) => p['_id'] == postId);
      if (postIndex != -1) {
        final post = posts[postIndex];
        final List<dynamic> commentsList = List.from(post['comments'] ?? []);
        final commentIndex = commentsList.indexWhere((c) => c['_id'] == commentId);
        if (commentIndex != -1) {
          final comment = Map<String, dynamic>.from(commentsList[commentIndex]);
          final List<dynamic> likes = List.from(comment['likes'] ?? []);
          final currentUserId = user?['_id'] ?? '';
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
      final idx = posts.indexWhere((p) => p['_id'] == postId);
      if (idx != -1) {
        posts[idx] = Map<String, dynamic>.from(updatedPost);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> likeReply(String postId, String commentId, String replyId) async {
    try {
      // Optimistic UI update
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
            final currentUserId = user?['_id'] ?? '';
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
      final idx = posts.indexWhere((p) => p['_id'] == postId);
      if (idx != -1) {
        posts[idx] = Map<String, dynamic>.from(updatedPost);
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

  int get friendsCount => user?['stats']?['friendsCount'] ?? 0;
  int get followersCount => user?['stats']?['followersCount'] ?? 0;
  int get followingCount => user?['stats']?['followingCount'] ?? 0;
  int get postCount => user?['stats']?['postCount'] ?? posts.length;

  String get username => user?['username'] ?? '';
  String get avatar => user?['avatar'] ?? '';
  String get email => user?['email'] ?? '';

  String get birthday {
    final raw = user?['birthday'];
    if (raw == null || raw.isEmpty) return '';
    try {
      final date = DateTime.parse(raw);
      return '${date.day.toString().padLeft(2, '0')} - ${date.month.toString().padLeft(2, '0')} - ${date.year}';
    } catch (_) {
      return raw;
    }
  }
  
  String get gender => user?['gender'] ?? '';

  String get address => user?['address'] ?? '';
  String get phone => user?['phone'] ?? '';
  String get job => user?['job'] ?? '';
  String get nationality => user?['nationality'] ?? '';

  void goToFriends(BuildContext context) {
    Navigator.pushNamed(context, Routes.friend);
  }

  void goToFollowing(BuildContext context) {
    Navigator.pushNamed(context, Routes.following);
  }

  void goToFollowers(BuildContext context) {
    Navigator.pushNamed(context, Routes.follower);
  }

  void goToQRCode(BuildContext context) {
    Navigator.pushNamed(context, Routes.code);
  }

  void goToAdd(BuildContext context) async {
    await Navigator.pushNamed(context, Routes.add);
    await loadUser();
  }
}