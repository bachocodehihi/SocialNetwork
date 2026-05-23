import 'package:dio/dio.dart';
class CallApi {
  final Dio _dio;
  CallApi(this._dio);

  Future<Map<String, dynamic>> getMissedCallCount({DateTime? since}) async {
    final Map<String, String>? query = since != null 
        ? {'since': since.millisecondsSinceEpoch.toString()} 
        : null;
    
    final res = await _dio.get('/calls/missed/count', queryParameters: query);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markMissedCallsRead() async {
    final res = await _dio.post('/calls/missed/read');
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
    
    final res = await _dio.get('/calls', queryParameters: params);
    return res.data as Map<String, dynamic>;
  }
}