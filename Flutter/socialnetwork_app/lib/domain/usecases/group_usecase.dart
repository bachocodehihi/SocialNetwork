import 'package:socialnetwork/domain/repositories/group_repository.dart';

class GroupUsecase {
  final GroupRepository _repository;
  GroupUsecase(this._repository);

  Future<Map<String, dynamic>> createGroup({
    required String name,
    required List<String> members,
  }) async {
    if (name.trim().isEmpty) throw Exception('Tên nhóm không được để trống');
    if (members.length < 2) throw Exception('Nhóm cần ít nhất 3 người');
    return _repository.createGroup(name: name, members: members);
  }

  Future<List<Map<String, dynamic>>> getGroups() async {
    return _repository.getGroups();
  }

  Future<Map<String, dynamic>> getGroupById(String groupId) async {
    return _repository.getGroupById(groupId);
  }

  Future<Map<String, dynamic>> inviteToGroup(String groupId, String inviteeId) async {
    return _repository.inviteToGroup(groupId, inviteeId);
  }

  Future<Map<String, dynamic>> getGroupByInviteCode(String inviteCode) async {
    return _repository.getGroupByInviteCode(inviteCode);
  }

  Future<Map<String, dynamic>> joinByQR(String inviteCode) async {
    return _repository.joinByQR(inviteCode);
  }

  Future<Map<String, dynamic>> removeMember(String groupId, String memberId) async {
    return _repository.removeMember(groupId, memberId);
  }
}