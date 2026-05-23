import 'package:socialnetwork/data/network/api/notification_api.dart';
import 'package:socialnetwork/domain/repositories/notification_repository.dart';

class NotificationRepositoryImp implements NotificationRepository {
  final NotificationApi _api;
  NotificationRepositoryImp(this._api);

  @override
  Future<List<Map<String, dynamic>>> getNotifications() {
    return _api.getNotifications();
  }

  @override
  Future<void> markAllRead() {
    return _api.markAllRead();
  }
}
