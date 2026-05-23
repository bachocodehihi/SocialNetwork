import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/main/tabs/message/chat/group/group_page.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/api/message_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/data/repositories/message_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';
import 'package:socialnetwork/domain/usecases/message_usecase.dart';

class ContactGroupController extends ChangeNotifier {
  final GroupUsecase _groupUsecase;
  final MessageUsecase _messageUsecase;

  List<Map<String, dynamic>> _groups = [];
  bool _isLoading = false;
  String? _error;

  ContactGroupController()
      : _groupUsecase = GroupUsecase(
          GroupRepositoryImp(GroupApi(DioClient.createDio())),
        ),
        _messageUsecase = MessageUsecase(
          MessageRepositoryImp(MessageApi(DioClient.createDio())),
        );

  List<Map<String, dynamic>> get groups => _groups;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchGroups() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _groups = await _groupUsecase.getGroups();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void goToCreateGroup(BuildContext context) {
    Navigator.pushNamed(context, Routes.createGroup);
  }

  Future<void> goToChat(BuildContext context, Map<String, dynamic> group) async {
    try {
      final members = (group['members'] as List)
          .map((m) => m['_id']?.toString() ?? m.toString())
          .toList();

      final conversation = await _messageUsecase.createConversation(
        receiverId: '',
        isGroup: true,
        name: group['name'],
        members: members,
        avatar: group['avatar'] ?? '',
      );

      final conversationId = conversation['_id'] as String;

      if (!context.mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ChatGroupPage(
            conversationId: conversationId,
            groupName: group['name'] ?? '',
            groupAvatar: group['avatar'] ?? '',
          ),
        ),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e')),
      );
    }
  }
}