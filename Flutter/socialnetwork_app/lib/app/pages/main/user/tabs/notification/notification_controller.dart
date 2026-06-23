import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/notification_api.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/notification_repository_imp.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/notification_usecase.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';

class NotificationUserController extends ChangeNotifier {
  late final NotificationUsecase _usecase;
  late final ContactUsecase _contactUsecase;
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = false;
  final Set<String> _processedRequestIds = {};
  final Map<String, String> _processedActions = {};

  NotificationUserController({NotificationUsecase? usecase, ContactUsecase? contactUsecase}) {
    final dio = DioClient.createDio();
    _usecase = usecase ??
        NotificationUsecase(
          NotificationRepositoryImp(
            NotificationApi(dio),
          ),
        );
    _contactUsecase = contactUsecase ??
        ContactUsecase(
          ContactRepositoryImp(
            ContactApi(dio),
          ),
        );
    loadNotifications();
  }

  List<Map<String, dynamic>> get notifications => _notifications;
  bool get loading => _loading;

  bool isProcessed(String requestId) => _processedRequestIds.contains(requestId);
  String? getProcessedAction(String requestId) => _processedActions[requestId];

  Future<void> loadNotifications() async {
    _loading = true;
    notifyListeners();
    try {
      _notifications = await _usecase.getNotifications();
    } catch (_) {
      _notifications = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> markAllRead() async {
    try {
      await _usecase.markAllRead();
      for (var item in _notifications) {
        item['isRead'] = true;
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> acceptFriend(String requestId) async {
    try {
      await _contactUsecase.acceptRequest(requestId);
      _processedRequestIds.add(requestId);
      _processedActions[requestId] = 'accepted';
      notifyListeners();
    } catch (_) {}
  }

  Future<void> rejectFriend(String requestId) async {
    try {
      await _contactUsecase.rejectRequest(requestId);
      _processedRequestIds.add(requestId);
      _processedActions[requestId] = 'rejected';
      notifyListeners();
    } catch (_) {}
  }
}
