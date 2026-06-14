
import 'package:socialnetwork/data/network/api/message_api.dart';
import 'package:socialnetwork/domain/repositories/message_repository.dart';

class MessageRepositoryImp implements MessageRepository {
  final MessageApi _api;

  MessageRepositoryImp(this._api);

  @override
  Future<Map<String, dynamic>> createConversation({
    required String receiverId,
    required bool isGroup,
    String? name,
    List<String>? members,
    String? avatar,
    String? groupId,
  }) => _api.createConversation(
    receiverId: receiverId,
    isGroup: isGroup,
    name: name,
    members: members,
    avatar: avatar,
    groupId: groupId,
  );

  @override
  Future<List<Map<String, dynamic>>> getConversations() =>
      _api.getConversations();

  @override
  Future<List<Map<String, dynamic>>> getMessages(
    String conversationId, {
    int limit = 50,
    String? before,
  }) => _api.getMessages(conversationId, limit: limit, before: before);

  @override
  Future<Map<String, dynamic>> sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    List<Map<String, dynamic>>? attachments,
  }) => _api.sendMessage(
    conversationId: conversationId,
    content: content,
    type: type,
    attachments: attachments,
  );
  
  @override
  Future<void> deleteMessage(String messageId, {bool forEveryone = false}) =>
      _api.deleteMessage(messageId, forEveryone: forEveryone);
  
  @override
  Future<void> markAsRead(String conversationId) =>
      _api.markAsRead(conversationId);

  @override
  Future<String?> uploadImage(String filePath) =>
      _api.uploadImage(filePath);

  @override
  Future<String?> uploadAudio(String filePath) =>
      _api.uploadAudio(filePath);
}