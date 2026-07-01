import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/domain/repositories/group_repository.dart';

class GroupRepositoryImp implements GroupRepository {
  final GroupApi _api;

  GroupRepositoryImp(this._api);

  @override
  Future<Map<String, dynamic>> createGroup({
    required String name,
    required List<String> members,
  }) async {
    final response = await _api.createGroup(name: name, members: members);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<List<Map<String, dynamic>>> getGroups() async {
    final response = await _api.getGroups();
    final data = response.data;

    if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data']);
    }

    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }

    return [];
  }

  @override
  Future<Map<String, dynamic>> getGroupById(String groupId) async {
    final response = await _api.getGroupById(groupId);
    final data = response.data;
    if (data is Map && data['data'] is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data['data']);
    }
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> inviteToGroup(String groupId, String inviteeId) async {
    final response = await _api.inviteToGroup(groupId, inviteeId);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> getGroupByInviteCode(String inviteCode) async {
    final response = await _api.getGroupByInviteCode(inviteCode);
    final data = response.data;
    if (data is Map && data['data'] is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data['data']);
    }
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> joinByQR(String inviteCode) async {
    final response = await _api.joinByQR(inviteCode);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }

  @override
  Future<Map<String, dynamic>> removeMember(String groupId, String memberId) async {
    final response = await _api.removeMember(groupId, memberId);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {};
  }
}