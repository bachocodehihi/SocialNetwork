import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class InviteController extends ChangeNotifier {
  final String groupId;
  late final ContactUsecase _contactUsecase;
  late final GroupUsecase _groupUsecase;

  List<Map<String, dynamic>> friends = [];
  Set<String> invitedFriendIds = {};
  bool isLoading = false;
  String? error;

  InviteController({
    required this.groupId,
    ContactUsecase? contactUsecase,
    GroupUsecase? groupUsecase,
  }) {
    final dio = DioClient.createDio();
    _contactUsecase = contactUsecase ??
        ContactUsecase(
          ContactRepositoryImp(
            ContactApi(dio),
          ),
        );

    _groupUsecase = groupUsecase ??
        GroupUsecase(
          GroupRepositoryImp(
            GroupApi(dio),
          ),
        );

    fetchFriends();
  }

  Future<void> fetchFriends() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      friends = await _contactUsecase.getFriends();
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> inviteFriend(String friendId) async {
    try {
      await _groupUsecase.inviteToGroup(groupId, friendId);
      invitedFriendIds.add(friendId);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
