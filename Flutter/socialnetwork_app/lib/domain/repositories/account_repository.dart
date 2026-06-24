abstract class AccountRepository {
  Future<List<Map<String, dynamic>>> searchUsers(String query);
  Future<void> addAddress(String address);
  Future<void> addPhone(String phone);
  Future<void> addJob(String job);
  Future<void> addNationality(String nationality);
  Future<Map<String, dynamic>> getProfile();
  Future<Map<String, dynamic>> getUserById(String id);
  Future<Map<String, dynamic>> getPrivacy();
  Future<Map<String, dynamic>> updatePrivacy(Map<String, bool> settings);
  Future<List<Map<String, dynamic>>> getSearchHistory();
  Future<void> saveSearchHistory(String searchedUserId);
  Future<void> deleteSearchHistory(String searchedUserId);
  Future<void> clearSearchHistory();
}