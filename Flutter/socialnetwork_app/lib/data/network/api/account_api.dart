import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class AccountApi {
  final Dio _dio;
  AccountApi(this._dio);

  Future<Options> _authOptions() async {
    final token = await AuthLocal.getToken();
    return Options(headers: {'Authorization': 'Bearer $token'});
  }

  Future<List<Map<String, dynamic>>> searchUsers(String query) async {
    try {
      final token = await AuthLocal.getToken();
      
      final response = await _dio.get(
        '/api/account/search',
        queryParameters: {'q': query},
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {

        final data = response.data;
        
        if (data == null) {
          return [];
        }
        
        if (data is List) {
          return data.map((item) {
            if (item is Map<String, dynamic>) {
              return item;
            } else if (item is Map) {
              return Map<String, dynamic>.from(item);
            }
            return <String, dynamic>{};
          }).toList();
        } else if (data is Map<String, dynamic>) {

          if (data.containsKey('users') && data['users'] is List) {
            final users = data['users'] as List;
            return users.map((item) => Map<String, dynamic>.from(item)).toList();
          }

          if (data.containsKey('data') && data['data'] is List) {
            final dataList = data['data'] as List;
            return dataList.map((item) => Map<String, dynamic>.from(item)).toList();
          }
          return [];
        }
        
        return [];
      } else {
        final message = response.data is Map 
            ? (response.data['code'] ?? 'Search failed') 
            : 'Search failed';
        throw Exception(message);
      }
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Network error occurred');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<Response> addAddress(String address) async {
    return await _dio.post(
      '/api/account/add-address',
      data: {'address': address},
      options: await _authOptions(),
    );
  }

  Future<Response> addPhone(String phone) async {
    return await _dio.post(
      '/api/account/add-phone',
      data: {'phone': phone},
      options: await _authOptions(),
    );
  }

  Future<Response> addJob(String job) async {
    return await _dio.post(
      '/api/account/add-job',
      data: {'job': job},
      options: await _authOptions(),
    );
  }

  Future<Response> addNationality(String nationality) async {
    return await _dio.post(
      '/api/account/add-nationality',
      data: {'nationality': nationality},
      options: await _authOptions(),
    );
  }

  Future<Response> getProfile() async {
    return await _dio.get(
      '/api/account/profile',
      options: await _authOptions(),
    );
  }

  Future<void> removeFcmToken() async {
    try {
      await _dio.post(
        '/api/account/remove-fcm-token',
        options: await _authOptions(),
      );
    } catch (_) {}
  }

  Future<List<Map<String, dynamic>>> getActivity() async {
    try {
      final response = await _dio.get(
        '/api/account/activity',
        options: await _authOptions(),
      );
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data']);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>> getUserById(String id) async {
    try {
      final response = await _dio.get(
        '/api/account/user/$id',
        options: await _authOptions(),
      );
      if (response.statusCode == 200 && response.data != null) {
        return Map<String, dynamic>.from(response.data);
      }
      throw Exception('Failed to load user profile');
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Network error occurred');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<Response> requestDeleteAccount() async {
    return await _dio.post(
      '/api/account/delete',
      options: await _authOptions(),
    );
  }

  Future<Response> cancelDeleteAccount() async {
    return await _dio.post(
      '/api/account/cancel-delete',
      options: await _authOptions(),
    );
  }

  Future<Map<String, dynamic>> getPrivacy() async {
    try {
      final response = await _dio.get(
        '/api/account/privacy',
        options: await _authOptions(),
      );
      if (response.statusCode == 200 && response.data != null) {
        return Map<String, dynamic>.from(response.data['privacy']);
      }
      throw Exception('Failed to load privacy settings');
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Network error occurred');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<Map<String, dynamic>> updatePrivacy(Map<String, bool> settings) async {
    try {
      final response = await _dio.put(
        '/api/account/privacy',
        data: settings,
        options: await _authOptions(),
      );
      if (response.statusCode == 200 && response.data != null) {
        return Map<String, dynamic>.from(response.data['privacy']);
      }
      throw Exception('Failed to update privacy settings');
    } on DioException catch (e) {
      throw Exception(e.message ?? 'Network error occurred');
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}