import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class ShareController extends ChangeNotifier {
  late final ContactUsecase _contactUsecase;
  late final GroupUsecase _groupUsecase;

  List<Map<String, dynamic>> friends = [];
  List<Map<String, dynamic>> groups = [];
  
  bool isLoading = false;
  String? error;

  final Set<String> sharedIds = {};

  ShareController({
    ContactUsecase? contactUsecase,
    GroupUsecase? groupUsecase,
  }) {
    _contactUsecase = contactUsecase ??
        ContactUsecase(
          ContactRepositoryImp(
            ContactApi(DioClient.createDio()),
          ),
        );
    _groupUsecase = groupUsecase ??
        GroupUsecase(
          GroupRepositoryImp(
            GroupApi(DioClient.createDio()),
          ),
        );
    fetchData();
  }

  Future<void> fetchData() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final friendsData = await _contactUsecase.getFriends();
      friends = friendsData.map((item) => Map<String, dynamic>.from(item)).toList();

      final groupsData = await _groupUsecase.getGroups();
      groups = groupsData.map((item) => Map<String, dynamic>.from(item)).toList();
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void toggleShare(String id) {
    if (sharedIds.contains(id)) {
      sharedIds.remove(id);
    } else {
      sharedIds.add(id);
    }
    notifyListeners();
  }
}
