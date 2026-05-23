import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/domain/repositories/contact_repository.dart';
class ContactRepositoryImp implements ContactRepository {
  final ContactApi _contactApi;
  ContactRepositoryImp(this._contactApi);

  @override
  Future<Map<String, dynamic>> sendRequest(String receiverId) =>
      _contactApi.sendRequest(receiverId);

  @override
  Future<void> cancelRequest(String requestId) =>
      _contactApi.cancelRequest(requestId);

  @override
  Future<List<Map<String, dynamic>>> getRequests() =>
      _contactApi.getRequests();

  @override
  Future<void> acceptRequest(String requestId) =>
      _contactApi.acceptRequest(requestId);

  @override
  Future<Map<String, dynamic>> getRelationship(String userId) =>
      _contactApi.getRelationship(userId);
  @override
  Future<void> rejectRequest(String requestId) =>
      _contactApi.rejectRequest(requestId);
  @override
  Future<void> removeFriend(String friendId) =>
      _contactApi.removeFriend(friendId);
  @override
  Future<List<Map<String, dynamic>>> getFriends() =>
    _contactApi.getFriends();
  @override
  Future<Map<String, dynamic>> getUserById(String userId) =>
      _contactApi.getUserById(userId);
}