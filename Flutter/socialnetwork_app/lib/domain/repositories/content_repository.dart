abstract class ContentRepository {
  Future<Map<String, dynamic>> createPost({
    required String content,
    required String postType,
    String? privacy,
    String? groupId,
    List<String>? imagePaths,
    List<String>? allowedFriends,
    List<String>? exceptedFriends,
  });

  Future<List<Map<String, dynamic>>> getFeed();

  Future<Map<String, dynamic>> likePost(String postId);

  Future<Map<String, dynamic>> commentPost(String postId, String content);

  Future<List<Map<String, dynamic>>> getUserPosts(String userId);

  Future<List<Map<String, dynamic>>> getGroupPosts(String groupId);

  Future<Map<String, dynamic>> likeComment(String commentId);

  Future<Map<String, dynamic>> likeReply(String commentId, String replyId);

  Future<Map<String, dynamic>> replyComment(String postId, String commentId, String content);
}
