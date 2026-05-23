abstract class NotificationRepository {
  Future<List<Map<String, dynamic>>> getNotifications();
  Future<void> markAllRead();
}
