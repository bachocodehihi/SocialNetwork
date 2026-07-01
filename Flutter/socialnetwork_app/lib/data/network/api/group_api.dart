import 'package:dio/dio.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class GroupApi {
  final Dio _dio;
  GroupApi(this._dio);

  Future<Response> createGroup({
    required String name,
    required List<String> members,
  }) async {
    final token = await AuthLocal.getToken();
    return _dio.post(
      '/api/groups',
      data: {'name': name, 'members': members},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getGroups() async {
    final token = await AuthLocal.getToken();
    return _dio.get(
      '/api/groups',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getGroupById(String groupId) async {
    final token = await AuthLocal.getToken();
    return _dio.get(
      '/api/groups/$groupId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> inviteToGroup(String groupId, String inviteeId) async {
    final token = await AuthLocal.getToken();
    return _dio.post(
      '/api/groups/$groupId/invite',
      data: {'inviteeId': inviteeId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> getGroupByInviteCode(String inviteCode) async {
    final token = await AuthLocal.getToken();
    return _dio.get(
      '/api/groups/invite/$inviteCode',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> joinByQR(String inviteCode) async {
    final token = await AuthLocal.getToken();
    return _dio.post(
      '/api/groups/join-qr',
      data: {'inviteCode': inviteCode},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }

  Future<Response> removeMember(String groupId, String memberId) async {
    final token = await AuthLocal.getToken();
    return _dio.delete(
      '/api/groups/$groupId/members/$memberId',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
  }
}