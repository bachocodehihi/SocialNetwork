import 'package:socialnetwork/domain/repositories/account_repository.dart';

class AccountUsecase {
  final AccountRepository _repository;
  AccountUsecase(this._repository);
  Future<List<Map<String, dynamic>>> searchUsers(String query) async {
    if (query.trim().isEmpty) {
      return [];
    }
    return await _repository.searchUsers(query.trim());
  }
  
  Future<void> addAddress(String address) =>
      _repository.addAddress(address);

  Future<void> addPhone(String phone) =>
      _repository.addPhone(phone);

  Future<void> addJob(String job) =>
      _repository.addJob(job);

  Future<void> addNationality(String nationality) =>
      _repository.addNationality(nationality);
  
  Future<Map<String, dynamic>> getProfile() => _repository.getProfile();
  Future<Map<String, dynamic>> getUserById(String id) => _repository.getUserById(id);
}