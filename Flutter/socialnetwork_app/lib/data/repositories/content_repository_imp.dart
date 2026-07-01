import 'package:socialnetwork/data/network/api/content_api.dart';
import 'package:socialnetwork/domain/repositories/content_repository.dart';

class ContentRepositoryImp implements ContentRepository {
  final ContentApi _api;

  ContentRepositoryImp(this._api);

  @override
  Future<Map<String, dynamic>> createPost({
    required String content,
    required String postType,
    String? privacy,
    String? groupId,
    List<String>? imagePaths,
    List<String>? allowedFriends,
    List<String>? exceptedFriends,
  }) async {
    final response = await _api.createPost(
      content: content,
      postType: postType,
      privacy: privacy,
      groupId: groupId,
      imagePaths: imagePaths,
      allowedFriends: allowedFriends,
      exceptedFriends: exceptedFriends,
    );
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<List<Map<String, dynamic>>> getFeed() async {
    final response = await _api.getFeed();
    final data = response.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }

  @override
  Future<Map<String, dynamic>> likePost(String postId) async {
    final response = await _api.likePost(postId);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> commentPost(String postId, String content) async {
    final response = await _api.commentPost(postId, content);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<List<Map<String, dynamic>>> getUserPosts(String userId) async {
    final response = await _api.getUserPosts(userId);
    final data = response.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }

  @override
  Future<List<Map<String, dynamic>>> getGroupPosts(String groupId) async {
    final response = await _api.getGroupPosts(groupId);
    final data = response.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }

  @override
  Future<Map<String, dynamic>> likeComment(String commentId) async {
    final response = await _api.likeComment(commentId);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> likeReply(String commentId, String replyId) async {
    final response = await _api.likeReply(commentId, replyId);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> replyComment(String postId, String commentId, String content) async {
    final response = await _api.replyComment(postId, commentId, content);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }
}
