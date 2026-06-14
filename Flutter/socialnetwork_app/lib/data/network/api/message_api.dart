
import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class MessageApi {
  final Dio _dio;
  
  MessageApi(this._dio);

  Future<Map<String, dynamic>> createConversation({
    required String receiverId,
    required bool isGroup,
    String? name,
    List<String>? members,
    String? avatar,
    String? groupId,
  }) async {
    final token = await AuthLocal.getToken();
    final res = await _dio.post(
      '/api/message',
      data: {
        'receiverId': receiverId,
        'isGroup': isGroup,
        if (name != null) 'name': name,
        if (members != null) 'members': members,
        if (avatar != null) 'avatar': avatar,
        if (groupId != null) 'groupId': groupId,
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final data = res.data;
    return data is Map<String, dynamic> ? data : {};
  }

  Future<List<Map<String, dynamic>>> getConversations() async {
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/message',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final data = res.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getMessages(
    String conversationId, {
    int limit = 50,
    String? before,
  }) async {
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/message/$conversationId/messages',
      queryParameters: {
        'limit': limit,
        if (before != null) 'before': before,
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final data = res.data;
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }

  Future<Map<String, dynamic>> sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    List<Map<String, dynamic>>? attachments,
  }) async {
    final token = await AuthLocal.getToken();
    final res = await _dio.post(
      '/api/message/$conversationId/send',
      data: {
        'content': content,
        'type': type,
        if (attachments != null) 'attachments': attachments,
      },
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final data = res.data;
    return data is Map<String, dynamic> ? data : {};
  }
  
  Future<void> deleteMessage(String messageId, {bool forEveryone = false}) async {
    final token = await AuthLocal.getToken();
    await _dio.delete(
      '/api/message/message/$messageId',
      data: {'forEveryone': forEveryone},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }
  
  Future<void> markAsRead(String conversationId) async {
    final token = await AuthLocal.getToken();
    await _dio.post(
      '/api/message/$conversationId/read',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<String?> uploadImage(String filePath) async {
    final token = await AuthLocal.getToken();
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(filePath),
    });
    final res = await _dio.post(
      '/api/message/upload-image',
      data: formData,
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'multipart/form-data',
        },
      ),
    );
    final data = res.data;
    if (data is Map && data['success'] == true) {
      return data['url']?.toString();
    }
    return null;
  }

  Future<String?> uploadAudio(String filePath) async {
    final token = await AuthLocal.getToken();
    final formData = FormData.fromMap({
      'audio': await MultipartFile.fromFile(filePath),
    });
    final res = await _dio.post(
      '/api/message/upload-audio',
      data: formData,
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'multipart/form-data',
        },
      ),
    );
    final data = res.data;
    if (data is Map && data['success'] == true) {
      return data['url']?.toString();
    }
    return null;
  }
}