abstract class AccountRepository {
  Future<List<Map<String, dynamic>>> searchUsers(String query);
  Future<void> addAddress(String address);
  Future<void> addPhone(String phone);
  Future<void> addJob(String job);
  Future<void> addNationality(String nationality);
  Future<Map<String, dynamic>> getProfile();
  Future<Map<String, dynamic>> getUserById(String id);
}