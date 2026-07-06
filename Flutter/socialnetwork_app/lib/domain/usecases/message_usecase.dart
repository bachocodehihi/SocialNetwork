import 'package:socialnetwork/domain/repositories/message_repository.dart';

class MessageUsecase {
  final MessageRepository _repository;
  
  MessageUsecase(this._repository);

  Future<Map<String, dynamic>> createConversation({
    required String receiverId,
    required bool isGroup,
    String? name,
    List<String>? members,
    String? avatar,
    String? groupId,
  }) async {
    return await _repository.createConversation(
      receiverId: receiverId,
      isGroup: isGroup,
      name: name,
      members: members,
      avatar: avatar,
      groupId: groupId,
    );
  }

  Future<List<Map<String, dynamic>>> getConversations() async {
    return await _repository.getConversations();
  }

  Future<List<Map<String, dynamic>>> getMessages(
    String conversationId, {
    int limit = 50,
    String? before,
  }) async {
    return await _repository.getMessages(conversationId, limit: limit, before: before);
  }

  Future<Map<String, dynamic>> sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    List<Map<String, dynamic>>? attachments,
    String? repliedTo,
  }) async {
    return await _repository.sendMessage(
      conversationId: conversationId,
      content: content,
      type: type,
      attachments: attachments,
      repliedTo: repliedTo,
    );
  }

  Future<void> deleteMessage(String messageId, {bool forEveryone = false}) async {
    await _repository.deleteMessage(messageId, forEveryone: forEveryone);
  }

  Future<void> markAsRead(String conversationId) async {
    await _repository.markAsRead(conversationId);
  }

  Future<String?> uploadImage(String filePath) async {
    return await _repository.uploadImage(filePath);
  }

  Future<String?> uploadAudio(String filePath) async {
    return await _repository.uploadAudio(filePath);
  }

  Future<Map<String, dynamic>> pinMessage(String conversationId, String messageId) async {
    return await _repository.pinMessage(conversationId, messageId);
  }

  Future<Map<String, dynamic>> unpinMessage(String conversationId) async {
    return await _repository.unpinMessage(conversationId);
  }

  Future<Map<String, dynamic>> editMessage({required String messageId, required String content}) async {
    return await _repository.editMessage(messageId: messageId, content: content);
  }

  Future<Map<String, dynamic>> getLinkPreview(String url) async {
    return await _repository.getLinkPreview(url);
  }
}