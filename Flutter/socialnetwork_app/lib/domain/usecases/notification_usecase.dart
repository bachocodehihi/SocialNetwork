import 'package:socialnetwork/domain/repositories/notification_repository.dart';

class NotificationUsecase {
  final NotificationRepository _repository;
  NotificationUsecase(this._repository);

  Future<List<Map<String, dynamic>>> getNotifications() => _repository.getNotifications();
  Future<void> markAllRead() => _repository.markAllRead();
}
