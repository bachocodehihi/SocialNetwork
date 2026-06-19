import 'package:socialnetwork/data/network/api/auth_api.dart';
import 'package:socialnetwork/domain/repositories/auth_repository.dart';
import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class AuthRepositoryImp implements AuthRepository {
  final AuthApi _authApi;
  AuthRepositoryImp(this._authApi);

  String _getCode(dynamic data, String fallback) {
    if (data is Map) {
      return data['code']?.toString() ?? fallback;
    }
    return fallback;
  }

  @override
  Future<void> sendOtp(String email) async {
    try {
      await _authApi.sendOtp(email);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> verifyOtp(String email, String otp) async {
    try {
      await _authApi.verifyOtp(email, otp);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> register({
    required String email,
    required String username,
    required String password,
    required String birthday,
    required String gender,
    String? avatar,
  }) async {
    try {
      await _authApi.register(
        email: email,
        username: username,
        password: password,
        birthday: birthday,
        gender: gender,
        avatar: avatar,
      );
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<bool> checkEmail(String email) async {
    try {
      final response = await _authApi.checkEmail(email);
      final exists = response.data['exists'] as bool? ?? false;
      return exists;
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> login({required String email, required String password, bool isVerifying = false}) async {
    try {
      final response = await _authApi.login(email: email, password: password, isVerifying: isVerifying);
      final token = response.data['token']?.toString() ?? '';
      final user = response.data['user'] as Map<String, dynamic>;
      await AuthLocal.saveLogin(token, email, user);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> googleLogin(String idToken) async {
    try {
      final response = await _authApi.googleLogin(idToken);
      final token = response.data['token']?.toString() ?? '';
      final user = response.data['user'] as Map<String, dynamic>;
      final email = user['email']?.toString() ?? '';
      await AuthLocal.saveLogin(token, email, user);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> forgotPassword({
    required String email,
    required String newPassword,
  }) async {
    try {
      await _authApi.forgotPassword(email: email, newPassword: newPassword);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }

  @override
  Future<void> confirmQRLogin({
    required String sessionId,
    required String token,
  }) async {
    try {
      await _authApi.confirmQRLogin(sessionId: sessionId, token: token);
    } on DioException catch (e) {
      throw Exception(_getCode(e.response?.data, 'SERVER_ERROR'));
    }
  }
}