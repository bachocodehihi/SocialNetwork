import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class ContactApi {
  final Dio _dio;
  ContactApi(this._dio);

  Future<Map<String, dynamic>> sendRequest(String receiverId) async {
    final token = await AuthLocal.getToken();
    final res = await _dio.post(
      '/api/contact/request',
      data: {'receiverId': receiverId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> getRelationship(String userId) async {
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/contact/relationship/$userId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Map<String, dynamic>.from(res.data);
  }

  Future<void> cancelRequest(String requestId) async {
    final token = await AuthLocal.getToken();
    await _dio.post(
      '/api/contact/cancel',
      data: {'requestId': requestId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<void> acceptRequest(String requestId) async {
    final token = await AuthLocal.getToken();
    await _dio.post(
      '/api/contact/accept',
      data: {'requestId': requestId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<Map<String, dynamic>>> getRequests() async {
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/contact/requests',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final responseData = res.data;
    if (responseData is Map && responseData['data'] is List) {
      return List<Map<String, dynamic>>.from(responseData['data']);
    }
    if (responseData is List) {
      return List<Map<String, dynamic>>.from(responseData);
    }
    return [];
  }

  Future<void> rejectRequest(String requestId) async {
    final token = await AuthLocal.getToken();
    await _dio.post(
      '/api/contact/reject',
      data: {'requestId': requestId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<void> removeFriend(String friendId) async {
    final token = await AuthLocal.getToken();
    await _dio.post(
      '/api/contact/remove',
      data: {'friendId': friendId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<List<Map<String, dynamic>>> getFriends() async {
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/contact/friends',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final responseData = res.data;
    if (responseData is Map && responseData['data'] is List) {
      return List<Map<String, dynamic>>.from(responseData['data']);
    }
    if (responseData is List) {
      return List<Map<String, dynamic>>.from(responseData);
    }
    return [];
  }

  Future<Map<String, dynamic>> getUserById(String userId) async {
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/account/user/$userId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return Map<String, dynamic>.from(res.data);
  }

}