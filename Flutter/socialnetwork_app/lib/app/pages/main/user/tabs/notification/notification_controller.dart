import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/notification_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/notification_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/notification_usecase.dart';

class NotificationController extends ChangeNotifier {
  late final NotificationUsecase _usecase;
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = false;

  NotificationController({NotificationUsecase? usecase}) {
    _usecase = usecase ??
        NotificationUsecase(
          NotificationRepositoryImp(
            NotificationApi(DioClient.createDio()),
          ),
        );
    loadNotifications();
  }

  List<Map<String, dynamic>> get notifications => _notifications;
  bool get loading => _loading;

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
      // Mark read locally
      for (var item in _notifications) {
        item['isRead'] = true;
      }
      notifyListeners();
    } catch (_) {}
  }
}
