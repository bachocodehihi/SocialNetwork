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
  Future<Map<String, dynamic>> getPrivacy() => _repository.getPrivacy();
  Future<Map<String, dynamic>> updatePrivacy(Map<String, bool> settings) => _repository.updatePrivacy(settings);
  Future<List<Map<String, dynamic>>> getSearchHistory() => _repository.getSearchHistory();
  Future<void> saveSearchHistory(String searchedUserId) => _repository.saveSearchHistory(searchedUserId);
  Future<void> deleteSearchHistory(String searchedUserId) => _repository.deleteSearchHistory(searchedUserId);
  Future<void> clearSearchHistory() => _repository.clearSearchHistory();
}