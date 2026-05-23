import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/data/repositories/account_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/data/enums/friend_status.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';

class UserController extends ChangeNotifier {
  Map<String, dynamic> _user;
  late final ContactUsecase _contactUsecase;
  late final AccountUsecase _accountUsecase;
  late final ContentUsecase _contentUsecase;

  FriendStatus _status = FriendStatus.none;
  String? _requestId;
  bool _loading = false;

  List<Map<String, dynamic>> posts = [];
  bool loadingPosts = false;

  UserController({
    required Map<String, dynamic> user,
    ContactUsecase? contactUsecase,
    AccountUsecase? accountUsecase,
  }) : _user = user {
    final dio = DioClient.createDio();
    _contactUsecase = contactUsecase ??
        ContactUsecase(
          ContactRepositoryImp(
            ContactApi(dio),
          ),
        );

    _accountUsecase = accountUsecase ??
        AccountUsecase(
          AccountRepositoryImp(
            AccountApi(dio),
          ),
        );

    _contentUsecase = ContentUsecase(
      ContentRepositoryImp(
        ContentApi(dio),
      ),
    );

    loadRelationship();
    loadUserDetails();
    loadUserPosts();
  }

  Future<void> loadUserDetails() async {
    try {
      final detailedUser = await _accountUsecase.getUserById(userId);
      _user = detailedUser;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> loadUserPosts() async {
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

  String get userId => _user['_id'] ?? _user['id'] ?? '';
  String get username => _user['username'] ?? 'Unknown';
  String get avatarUrl => _user['avatar'] ?? '';
  String get email => _user['email'] as String? ?? '';
  String get avatar => _user['avatar'] as String? ?? '';
  
  String get birthday {
    final raw = _user['birthday'] as String? ?? '';
    if (raw.isEmpty) return '';
    try {
      final date = DateTime.parse(raw);
      return '${date.day.toString().padLeft(2, '0')} - ${date.month.toString().padLeft(2, '0')} - ${date.year}';
    } catch (_) {
      return raw;
    }
  }
  
  String get gender => _user['gender'] as String? ?? '';
  String get address => _user['address'] as String? ?? '';
  String get phone => _user['phone'] as String? ?? _user['phone_number'] as String? ?? '';
  String get job => _user['job'] as String? ?? _user['occupation'] as String? ?? '';

  int get friendsCount => _user['friendsCount'] as int? ?? 0;
  int get followersCount => _user['followersCount'] as int? ?? 0;
  int get followingCount => _user['followingCount'] as int? ?? 0;
  int get postCount => _user['postCount'] as int? ?? posts.length;

  FriendStatus get status => _status;
  String? get requestId => _requestId;
  bool get loading => _loading;

  Future<void> loadRelationship() async {
    try {
      final res = await _contactUsecase.getRelationship(userId);

      switch (res['status']) {
        case 'requested':
          _requestId = res['requestId'];
          _status = FriendStatus.requested;
          break;
        case 'received':
          _status = FriendStatus.received;
          _requestId = res['requestId'];
          break;
        case 'friend':
          _status = FriendStatus.friend;
          break;
        default:
          _status = FriendStatus.none;
      }

      notifyListeners();
    } catch (_) {}  
  }

  Future<void> sendFriendRequest() async {
    if (_loading) return;

    _loading = true;
    notifyListeners();

    try {
      final res = await _contactUsecase.sendRequest(userId);

      if (res['type'] == 'auto_accepted') {
        _status = FriendStatus.friend;
      } else {
        _status = FriendStatus.requested;
        _requestId = res['requestId'];
      }
    } catch (_) {}

    _loading = false;
    notifyListeners();
  }

  Future<void> cancelFriendRequest() async {
    if (_loading || _requestId == null) return;

    _loading = true;
    notifyListeners();

    await _contactUsecase.cancelRequest(_requestId!);

    _status = FriendStatus.none;
    _requestId = null;

    _loading = false;
    notifyListeners();
  }

  Future<void> acceptRequest() async {
    if (_loading || _requestId == null) return;

    _loading = true;
    notifyListeners();

    await _contactUsecase.acceptRequest(_requestId!);

    _status = FriendStatus.friend;

    _loading = false;
    notifyListeners();
  }

  Future<void> rejectRequest() async {
    if (_loading || _requestId == null) return;

    _loading = true;
    notifyListeners();

    await _contactUsecase.rejectRequest(_requestId!);

    _status = FriendStatus.none;
    _requestId = null;

    _loading = false;
    notifyListeners();
  }

  Future<void> unfriend() async {
    if (_loading) return;

    _loading = true;
    notifyListeners();

    try {
      await _contactUsecase.removeFriend(userId);

      _status = FriendStatus.none;
      _requestId = null;
    } catch (_) {}

    _loading = false;
    notifyListeners();
  }
}