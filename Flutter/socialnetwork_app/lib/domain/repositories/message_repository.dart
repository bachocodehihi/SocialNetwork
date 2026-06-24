abstract class MessageRepository {
  Future<Map<String, dynamic>> createConversation({
    required String receiverId,
    required bool isGroup,
    String? name,
    List<String>? members,
    String? avatar,
    String? groupId,
  });

  Future<List<Map<String, dynamic>>> getConversations();

  Future<List<Map<String, dynamic>>> getMessages(
    String conversationId, {
    int limit = 50,
    String? before,
  });
  
  Future<Map<String, dynamic>> sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    List<Map<String, dynamic>>? attachments,
  });
  
  Future<void> deleteMessage(String messageId, {bool forEveryone = false});
  
  Future<void> markAsRead(String conversationId);

  Future<String?> uploadImage(String filePath);

  Future<String?> uploadAudio(String filePath);

  Future<Map<String, dynamic>> pinMessage(String conversationId, String messageId);
  Future<Map<String, dynamic>> unpinMessage(String conversationId);
}