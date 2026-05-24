import 'package:dio/dio.dart';
import 'package:socialnetwork/data/ip/ip.dart'; 
import 'package:socialnetwork/data/port/port.dart'; 
class DioClient {
  static Dio createDio() {
    final baseUrl = IpConfig.baseUrl;
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
        validateStatus: (status) => status != null && status < 400,
      ),
    );

    return dio;
  }
}