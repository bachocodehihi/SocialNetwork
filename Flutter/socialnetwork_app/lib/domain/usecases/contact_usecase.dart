import 'package:socialnetwork/domain/repositories/contact_repository.dart';

class ContactUsecase {
  final ContactRepository _repository;
  ContactUsecase(this._repository);

  Future<Map<String, dynamic>> sendRequest(String receiverId) =>
      _repository.sendRequest(receiverId);

  Future<void> cancelRequest(String requestId) =>
      _repository.cancelRequest(requestId);

  Future<List<Map<String, dynamic>>> getRequests() =>
      _repository.getRequests();

  Future<void> acceptRequest(String requestId) =>
      _repository.acceptRequest(requestId);

  Future<Map<String, dynamic>> getRelationship(String userId) =>
      _repository.getRelationship(userId);

  Future<void> rejectRequest(String requestId) =>
      _repository.rejectRequest(requestId);

  Future<void> removeFriend(String friendId) =>
    _repository.removeFriend(friendId);

  Future<List<Map<String, dynamic>>> getFriends() =>
    _repository.getFriends();
  Future<Map<String, dynamic>> getUserById(String userId) =>
    _repository.getUserById(userId);
}