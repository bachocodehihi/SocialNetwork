abstract class ContactRepository {
  Future<Map<String, dynamic>> sendRequest(String receiverId);
  Future<void> cancelRequest(String requestId);
  Future<List<Map<String, dynamic>>> getRequests();
  Future<void> acceptRequest(String requestId);
  Future<Map<String, dynamic>> getRelationship(String userId);
  Future<void> rejectRequest(String requestId);
  Future<void> removeFriend(String friendId);
  Future<List<Map<String, dynamic>>> getFriends();
  Future<Map<String, dynamic>> getUserById(String userId);
}