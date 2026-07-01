import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class JoinGroupController extends ChangeNotifier {
  final GroupUsecase _groupUsecase;
  bool isLoading = false;
  String? error;

  JoinGroupController({GroupUsecase? groupUsecase})
      : _groupUsecase = groupUsecase ??
            GroupUsecase(
              GroupRepositoryImp(
                GroupApi(DioClient.createDio()),
              ),
            );

  Future<Map<String, dynamic>?> joinGroup(String inviteCode) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _groupUsecase.joinByQR(inviteCode);
      isLoading = false;
      notifyListeners();
      if (res['success'] == true) {
        return res;
      } else {
        error = res['message'] ?? 'Không thể tham gia nhóm';
        notifyListeners();
        return null;
      }
    } catch (e) {
      isLoading = false;
      error = e.toString();
      notifyListeners();
      return null;
    }
  }
}
