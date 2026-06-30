import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class MemberController extends ChangeNotifier {
  final String groupId;
  late final GroupUsecase _groupUsecase;

  Map<String, dynamic> group = {};
  List<Map<String, dynamic>> members = [];
  String? adminId;
  bool isLoading = false;
  String? error;

  MemberController({
    required this.groupId,
    GroupUsecase? groupUsecase,
  }) {
    _groupUsecase = groupUsecase ??
        GroupUsecase(
          GroupRepositoryImp(
            GroupApi(DioClient.createDio()),
          ),
        );
    fetchMembers();
  }

  Future<void> fetchMembers() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _groupUsecase.getGroupById(groupId);
      group = res;
      final rawMembers = res['members'] as List? ?? [];
      members = List<Map<String, dynamic>>.from(
        rawMembers.map((m) => Map<String, dynamic>.from(m as Map)),
      );
      final admin = res['admin'];
      if (admin is Map) {
        adminId = admin['_id']?.toString();
      } else {
        adminId = admin?.toString();
      }
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
