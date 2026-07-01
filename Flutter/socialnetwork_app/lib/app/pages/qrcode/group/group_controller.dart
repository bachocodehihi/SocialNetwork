import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class QRCodeGroupController extends ChangeNotifier {
  final String groupId;
  late final GroupUsecase _groupUsecase;

  Map<String, dynamic>? group;
  bool isLoading = false;
  String? error;

  QRCodeGroupController({
    required this.groupId,
    GroupUsecase? groupUsecase,
  }) {
    _groupUsecase = groupUsecase ??
        GroupUsecase(
          GroupRepositoryImp(
            GroupApi(DioClient.createDio()),
          ),
        );
    loadGroup();
  }

  Future<void> loadGroup() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _groupUsecase.getGroupById(groupId);
      group = res;
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  String? get groupName => group?['name'];
  String? get qrCode => group?['qrCode'];
}