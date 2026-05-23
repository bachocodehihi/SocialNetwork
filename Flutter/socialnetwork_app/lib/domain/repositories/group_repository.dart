abstract class GroupRepository {
  Future<Map<String, dynamic>> createGroup({
    required String name,
    required List<String> members,
  });

  Future<List<Map<String, dynamic>>> getGroups();

  Future<Map<String, dynamic>> getGroupById(String groupId);

  Future<Map<String, dynamic>> inviteToGroup(String groupId, String inviteeId);
}