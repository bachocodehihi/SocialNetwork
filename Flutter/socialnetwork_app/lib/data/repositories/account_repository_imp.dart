import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/domain/repositories/account_repository.dart';
import 'package:dio/dio.dart';
class AccountRepositoryImp implements AccountRepository {
  final AccountApi _accountApi;

  AccountRepositoryImp(this._accountApi);

  @override
  Future<List<Map<String, dynamic>>> searchUsers(String query) {
    return _accountApi.searchUsers(query);
  }

  String _getCode(dynamic data, String fallback) {
    if (data is Map) {
      return data['code']?.toString() ?? fallback;
    }
    return fallback;
  }

  @override
  Future<void> addAddress(String address) async {
    try {
      await _accountApi.addAddress(address);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> addPhone(String phone) async {
    try {
      await _accountApi.addPhone(phone);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> addJob(String job) async {
    try {
      await _accountApi.addJob(job);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> addNationality(String job) async {
    try {
      await _accountApi.addNationality(job);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }
  @override
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _accountApi.getProfile();
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<Map<String, dynamic>> getUserById(String id) async {
    try {
      return await _accountApi.getUserById(id);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }
}