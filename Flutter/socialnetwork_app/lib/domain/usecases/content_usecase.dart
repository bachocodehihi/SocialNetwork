import 'package:socialnetwork/domain/repositories/content_repository.dart';

class ContentUsecase {
  final ContentRepository _repository;

  ContentUsecase(this._repository);

  Future<Map<String, dynamic>> createPost({
    required String content,
    required String postType,
    String? privacy,
    String? groupId,
    List<String>? imagePaths,
    List<String>? allowedFriends,
    List<String>? exceptedFriends,
  }) async {
    if (content.trim().isEmpty) {
      throw Exception('Nội dung không được để trống');
    }
    if (postType == 'group' && groupId == null) {
      throw Exception('Nhóm chưa được chọn');
    }
    return _repository.createPost(
      content: content,
      postType: postType,
      privacy: privacy,
      groupId: groupId,
      imagePaths: imagePaths,
      allowedFriends: allowedFriends,
      exceptedFriends: exceptedFriends,
    );
  }

  Future<List<Map<String, dynamic>>> getFeed() async {
    return _repository.getFeed();
  }

  Future<Map<String, dynamic>> likePost(String postId) async {
    return _repository.likePost(postId);
  }

  Future<Map<String, dynamic>> commentPost(String postId, String content) async {
    if (content.trim().isEmpty) {
      throw Exception('Nội dung bình luận không được để trống');
    }
    return _repository.commentPost(postId, content);
  }

  Future<List<Map<String, dynamic>>> getUserPosts(String userId) async {
    return _repository.getUserPosts(userId);
  }

  Future<List<Map<String, dynamic>>> getGroupPosts(String groupId) async {
    return _repository.getGroupPosts(groupId);
  }

  Future<Map<String, dynamic>> likeComment(String commentId) async {
    return _repository.likeComment(commentId);
  }

  Future<Map<String, dynamic>> likeReply(String commentId, String replyId) async {
    return _repository.likeReply(commentId, replyId);
  }

  Future<Map<String, dynamic>> replyComment(String postId, String commentId, String content) async {
    if (content.trim().isEmpty) {
      throw Exception('Nội dung phản hồi không được để trống');
    }
    return _repository.replyComment(postId, commentId, content);
  }
}
