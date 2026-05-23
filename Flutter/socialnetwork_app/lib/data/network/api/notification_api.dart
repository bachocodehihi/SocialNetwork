import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class NotificationApi {
  final Dio _dio;
  NotificationApi(this._dio);

  Future<Options> _authOptions() async {
    final token = await AuthLocal.getToken();
    return Options(headers: {'Authorization': 'Bearer $token'});
  }

  Future<List<Map<String, dynamic>>> getNotifications() async {
    try {
      final response = await _dio.get(
        '/api/notification',
        options: await _authOptions(),
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        if (data is List) {
          return data.map((item) => Map<String, dynamic>.from(item)).toList();
        }
      }
      return [];
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Network error occurred');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> markAllRead() async {
    try {
      await _dio.post(
        '/api/notification/mark-read',
        options: await _authOptions(),
      );
    } catch (_) {}
  }
}
