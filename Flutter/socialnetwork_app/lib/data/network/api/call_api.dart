import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class CallApi {
  final Dio _dio;
  CallApi(this._dio);

  Future<Map<String, dynamic>> getMissedCallCount({DateTime? since}) async {
    final Map<String, String>? query = since != null 
        ? {'since': since.millisecondsSinceEpoch.toString()} 
        : null;
    
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/calls/missed/count',
      queryParameters: query,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markMissedCallsRead() async {
    final token = await AuthLocal.getToken();
    final res = await _dio.post(
      '/api/calls/missed/read',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getCallHistory({
    int page = 1,
    int limit = 20,
    String? type,
    String? status,
    bool onlyMissed = false,
  }) async {
    final Map<String, dynamic> params = {
      'page': page,
      'limit': limit,
      if (type != null) 'type': type,
      if (status != null) 'status': status,
      if (onlyMissed) 'onlyMissed': 'true',
    };
    
    final token = await AuthLocal.getToken();
    final res = await _dio.get(
      '/api/calls',
      queryParameters: params,
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    return res.data as Map<String, dynamic>;
  }
}