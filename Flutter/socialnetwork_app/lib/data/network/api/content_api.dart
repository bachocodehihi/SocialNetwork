import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class ContentApi {
  final Dio _dio;
  ContentApi(this._dio);

  Future<Response> createPost({
    required String content,
    required String postType,
    String? privacy,
    String? groupId,
    List<String>? imagePaths,
    List<String>? allowedFriends,
    List<String>? exceptedFriends,
  }) async {
    final token = await AuthLocal.getToken();
    
    final Map<String, dynamic> data = {
      'content': content,
      'postType': postType,
    };
    if (privacy != null) {
      data['privacy'] = privacy;
    }
    if (groupId != null) {
      data['group'] = groupId;
    }
    if (allowedFriends != null && allowedFriends.isNotEmpty) {
      data['allowedFriends'] = allowedFriends.join(',');
    }
    if (exceptedFriends != null && exceptedFriends.isNotEmpty) {
      data['exceptedFriends'] = exceptedFriends.join(',');
    }

    final formData = FormData.fromMap(data);

    if (imagePaths != null && imagePaths.isNotEmpty) {
      for (final path in imagePaths) {
        formData.files.add(MapEntry(
          'images',
          await MultipartFile.fromFile(path),
        ));
      }
    }

    return _dio.post(
      '/api/content',
      data: formData,
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'multipart/form-data',
        },
      ),
    );
  }

  Future<Response> getFeed() async {
    final token = await AuthLocal.getToken();
    return _dio.get(
      '/api/content',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> likePost(String postId) async {
    final token = await AuthLocal.getToken();
    return _dio.put(
      '/api/content/$postId/like',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> commentPost(String postId, String content) async {
    final token = await AuthLocal.getToken();
    return _dio.post(
      '/api/content/$postId/comment',
      data: {'content': content},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getUserPosts(String userId) async {
    final token = await AuthLocal.getToken();
    return _dio.get(
      '/api/content/user/$userId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getGroupPosts(String groupId) async {
    final token = await AuthLocal.getToken();
    return _dio.get(
      '/api/content/group/$groupId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> likeComment(String commentId) async {
    final token = await AuthLocal.getToken();
    return _dio.put(
      '/api/content/comment/$commentId/like',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> likeReply(String commentId, String replyId) async {
    final token = await AuthLocal.getToken();
    return _dio.put(
      '/api/content/comment/$commentId/reply/$replyId/like',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> replyComment(String postId, String commentId, String content) async {
    final token = await AuthLocal.getToken();
    return _dio.post(
      '/api/content/$postId/comment/$commentId/reply',
      data: {'content': content},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }
}
