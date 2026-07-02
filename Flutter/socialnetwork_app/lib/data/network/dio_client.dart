import 'package:dio/dio.dart';
import 'package:socialnetwork/data/config/config.dart';
class DioClient {
  static Dio createDio() {
    final baseUrl = Config.baseUrl;
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 60),
        receiveTimeout: const Duration(seconds: 60),
        headers: {'Content-Type': 'application/json'},
        validateStatus: (status) => status != null && status < 400,
      ),
    );

    return dio;
  }
}