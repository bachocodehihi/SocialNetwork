import 'package:flutter/material.dart';
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class HomeUserController extends ChangeNotifier {
  final ContentUsecase _contentUsecase = ContentUsecase(
    ContentRepositoryImp(
      ContentApi(DioClient.createDio()),
    ),
  );

  Map<String, dynamic>? user;
  bool _isOffline = false;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  List<Map<String, dynamic>> posts = [];
  bool isLoadingFeed = false;

  bool get isOffline => _isOffline;

  HomeUserController() {
    loadUser();
    initConnectivity();
    loadFeed();
  }

  Future<void> loadUser() async {
    user = await AuthLocal.getCurrentUser();
    notifyListeners();
  }

  void initConnectivity() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      _updateConnectionStatus(results);
    });
    
    Connectivity().checkConnectivity().then((results) {
      _updateConnectionStatus(results);
    });
  }

  void _updateConnectionStatus(List<ConnectivityResult> results) {
    final isNone = results.isEmpty || (results.length == 1 && results.first == ConnectivityResult.none);
    if (_isOffline != isNone) {
      _isOffline = isNone;
      notifyListeners();
    }
  }

  Future<void> loadFeed() async {
    isLoadingFeed = true;
    notifyListeners();
    try {
      posts = await _contentUsecase.getFeed();
    } catch (e) {
      debugPrint('Error loading feed: $e');
    } finally {
      isLoadingFeed = false;
      notifyListeners();
    }
  }

  Future<void> likePost(String postId) async {
    try {
      // Optimitic UI update
      final index = posts.indexWhere((p) => p['_id'] == postId);
      if (index != -1) {
        final currentUserId = user?['_id'] ?? '';
        final post = posts[index];
        final List<dynamic> likes = List.from(post['likes'] ?? []);
        if (likes.contains(currentUserId)) {
          likes.remove(currentUserId);
        } else {
          likes.add(currentUserId);
        }
        post['likes'] = likes;
        notifyListeners();
      }

      final result = await _contentUsecase.likePost(postId);
      if (result.containsKey('post')) {
        final updatedPost = result['post'];
        final index = posts.indexWhere((p) => p['_id'] == postId);
        if (index != -1) {
          posts[index] = updatedPost;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error liking post: $e');
      // Reload feed in case of failure to sync UI
      loadFeed();
    }
  }

  Future<void> addComment(String postId, String content) async {
    try {
      final result = await _contentUsecase.commentPost(postId, content);
      if (result.containsKey('post')) {
        final updatedPost = result['post'];
        final index = posts.indexWhere((p) => p['_id'] == postId);
        if (index != -1) {
          posts[index] = updatedPost;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error adding comment: $e');
    }
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
      if (result.containsKey('post')) {
        final updatedPost = result['post'];
        final postIndex = posts.indexWhere((p) => p['_id'] == postId);
        if (postIndex != -1) {
          posts[postIndex] = updatedPost;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error liking comment: $e');
    }
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
      if (result.containsKey('post')) {
        final updatedPost = result['post'];
        final postIndex = posts.indexWhere((p) => p['_id'] == postId);
        if (postIndex != -1) {
          posts[postIndex] = updatedPost;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error liking reply: $e');
    }
  }

  Future<void> addReply(String postId, String commentId, String content) async {
    try {
      final result = await _contentUsecase.replyComment(postId, commentId, content);
      if (result.containsKey('post')) {
        final updatedPost = result['post'];
        final index = posts.indexWhere((p) => p['_id'] == postId);
        if (index != -1) {
          posts[index] = updatedPost;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error adding reply: $e');
    }
  }

  String get avatar => user?['avatar'] ?? '';
  String get userId => user?['_id'] ?? '';

  void goToSearch(BuildContext context) {
    Navigator.pushNamed(context, Routes.search);
  }

  void goToScanner(BuildContext context) {
    Navigator.pushNamed(context, Routes.scanner);
  }

  Future<void> goToPostContent(BuildContext context) async {
    final result = await Navigator.pushNamed(context, Routes.postContent);
    if (result == true) {
      loadFeed();
    }
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}