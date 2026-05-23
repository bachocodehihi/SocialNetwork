import 'package:socialnetwork/domain/repositories/auth_repository.dart';

class AuthUsecase {
  final AuthRepository _repository;
  AuthUsecase(this._repository);

  Future<void> sendOtp(String email) => _repository.sendOtp(email);

  Future<void> verifyOtp(String email, String otp) =>
      _repository.verifyOtp(email, otp);

  Future<void> register({
    required String email,
    required String username,
    required String password,
    required String birthday,
    required String gender,
    String? avatar,
  }) => _repository.register(
    email: email,
    username: username,
    password: password,
    birthday: birthday,
    gender: gender,
    avatar: avatar,
  );

  Future<bool> checkEmail(String email) => _repository.checkEmail(email);

  Future<void> login({required String email, required String password}) =>
    _repository.login(email: email, password: password);

  Future<void> forgotPassword({
    required String email,
    required String newPassword,
  }) => _repository.forgotPassword(email: email, newPassword: newPassword);

  Future<void> confirmQRLogin({
    required String sessionId,
    required String token,
  }) => _repository.confirmQRLogin(sessionId: sessionId, token: token);
}