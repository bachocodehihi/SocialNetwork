import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socialnetwork/data/config/config.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/service/call.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  debugPrint('📬 Background message received in handler: ${message.messageId}');
  if (message.notification == null) {
    final service = NotificationService();
    await service.setupLocalNotifications();
    await NotificationService.showNotificationFromMessage(message);
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final _fcm = FirebaseMessaging.instance;
  final _localNotif = FlutterLocalNotificationsPlugin();

  static const _chatChannelId = 'chat_channel';
  static const _callChannelId = 'call_channel';
  static const _generalChannelId = 'general_channel';

  void Function(Map<String, dynamic> data)? onNotificationTap;

  Future<void> init() async {
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (defaultTargetPlatform == TargetPlatform.android) {
      final androidImplementation = _localNotif.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      await androidImplementation?.requestNotificationsPermission();
    }

    await _fcm.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    await setupLocalNotifications();

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    FirebaseMessaging.onMessage.listen((message) {
      debugPrint('📬 Foreground message: ${message.data}');
      final type = message.data['type'] ?? '';
      if (type == 'call') {
        debugPrint('📞 Call message in foreground, skip local notification');
        return;
      }
      showNotificationFromMessage(message);
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('👆 Tapped (background): ${message.data}');
      onNotificationTap?.call(message.data);
    });

    final initial = await _fcm.getInitialMessage();
    if (initial != null) {
      debugPrint('👆 Tapped (killed): ${initial.data}');
      await Future.delayed(const Duration(seconds: 1));
      onNotificationTap?.call(initial.data);
    }

    await _saveFcmToken();

    _fcm.onTokenRefresh.listen((token) async {
      debugPrint('🔄 FCM token refreshed');
      await _sendTokenToServer(token);
    });

    debugPrint('✅ NotificationService initialized');
  }

  Future<void> setupLocalNotifications() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    final iosInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
      notificationCategories: [
        DarwinNotificationCategory(
          'friend_request_category',
          actions: [
            DarwinNotificationAction.plain('accept_friend', 'Đồng ý'),
            DarwinNotificationAction.plain('reject_friend', 'Từ chối'),
          ],
        ),
        DarwinNotificationCategory(
          'call_category',
          actions: [
            DarwinNotificationAction.plain('accept_call', 'Nghe'),
            DarwinNotificationAction.plain('reject_call', 'Từ chối'),
          ],
        ),
      ],
    );

    await _localNotif.initialize(
      InitializationSettings(android: androidInit, iOS: iosInit),
      onDidReceiveNotificationResponse: (details) async {
        final actionId = details.actionId;
        final payload = details.payload;
        if (payload != null) {
          try {
            final data = jsonDecode(payload);
            if (actionId == 'accept_friend' || actionId == 'reject_friend') {
              final requestId = data['relatedId']?.toString();
              final notifId = data['notificationId'] as int?;
              if (requestId != null) {
                final isAccept = actionId == 'accept_friend';
                await _handleFriendRequestAction(requestId, isAccept, notifId);
              }
            } else if (actionId == 'accept_call' || actionId == 'reject_call') {
              CallService().pendingNotificationAction = actionId;
              onNotificationTap?.call(data);
            } else {
              onNotificationTap?.call(data);
            }
          } catch (_) {}
        }
      },
    );

    final android = _localNotif.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    await android?.createNotificationChannel(const AndroidNotificationChannel(
      _chatChannelId,
      'Tin nhắn',
      description: 'Thông báo tin nhắn mới',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    ));

    await android?.createNotificationChannel(const AndroidNotificationChannel(
      _callChannelId,
      'Cuộc gọi',
      description: 'Thông báo cuộc gọi đến',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    ));

    await android?.createNotificationChannel(const AndroidNotificationChannel(
      _generalChannelId,
      'Thông báo chung',
      description: 'Thông báo khác',
      importance: Importance.defaultImportance,
    ));
  }

  static Future<void> showNotificationFromMessage(RemoteMessage message) async {
    final localNotif = NotificationService()._localNotif;

    final data = message.data;
    final type = data['type'] ?? 'general';

    final title = data['title'] ?? data['senderName'] ?? _defaultTitle(type);
    final body = data['body'] ?? '';

    String channelId;
    Importance importance;
    Priority priority;

    switch (type) {
      case 'call':
        channelId = _callChannelId;
        importance = Importance.max;
        priority = Priority.max;
        break;
      case 'message':
        channelId = _chatChannelId;
        importance = Importance.high;
        priority = Priority.high;
        break;
      default:
        channelId = _generalChannelId;
        importance = Importance.defaultImportance;
        priority = Priority.defaultPriority;
    }

    ByteArrayAndroidBitmap? largeIcon;
    final avatarUrl = data['senderAvatar']?.toString();
    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      try {
        String fullUrl = avatarUrl;
        if (!fullUrl.startsWith('http')) {
          fullUrl = '${Config.baseUrl}$fullUrl';
        }
        final response = await DioClient.createDio().get<List<int>>(
          fullUrl,
          options: Options(responseType: ResponseType.bytes),
        );
        if (response.data != null) {
          largeIcon = ByteArrayAndroidBitmap(Uint8List.fromList(response.data!));
        }
      } catch (e) {
        debugPrint('⚠️ Error downloading sender avatar: $e');
      }
    }

    List<AndroidNotificationAction>? actions;
    if (type == 'friend_request') {
      actions = [
        const AndroidNotificationAction(
          'accept_friend',
          'Đồng ý',
          showsUserInterface: true,
          cancelNotification: true,
        ),
        const AndroidNotificationAction(
          'reject_friend',
          'Từ chối',
          showsUserInterface: true,
          cancelNotification: true,
        ),
      ];
    } else if (type == 'call') {
      actions = [
        const AndroidNotificationAction(
          'accept_call',
          'Nghe',
          showsUserInterface: true,
          cancelNotification: true,
        ),
        const AndroidNotificationAction(
          'reject_call',
          'Từ chối',
          showsUserInterface: true,
          cancelNotification: true,
        ),
      ];
    }

    final androidDetails = AndroidNotificationDetails(
      channelId,
      _channelName(channelId),
      importance: importance,
      priority: priority,
      styleInformation: BigTextStyleInformation(body),
      groupKey: data['conversationId'] ?? 'general',
      icon: '@mipmap/ic_launcher',
      largeIcon: largeIcon,
      actions: actions,
    );

    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      categoryIdentifier: type == 'friend_request'
          ? 'friend_request_category'
          : (type == 'call' ? 'call_category' : null),
    );

    final notifId = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final Map<String, dynamic> payloadData = Map<String, dynamic>.from(data);
    payloadData['notificationId'] = notifId;

    await localNotif.show(
      notifId,
      title,
      body,
      NotificationDetails(android: androidDetails, iOS: iosDetails),
      payload: jsonEncode(payloadData),
    );
  }

  static String _channelName(String id) {
    switch (id) {
      case _chatChannelId: return 'Tin nhắn';
      case _callChannelId: return 'Cuộc gọi';
      default: return 'Thông báo chung';
    }
  }

  static String _defaultTitle(String type) {
    switch (type) {
      case 'call': return 'Cuộc gọi đến';
      case 'message': return 'Tin nhắn mới';
      default: return 'Thông báo';
    }
  }

  Future<void> _saveFcmToken() async {
    final token = await _fcm.getToken();
    if (token != null) {
      debugPrint('📱 FCM Token: ${token.substring(0, 20)}...');
      await _sendTokenToServer(token);
    }
  }

  Future<void> _sendTokenToServer(String token) async {
    final authToken = await AuthLocal.getToken();
    if (authToken == null) return;
    try {
      await DioClient.createDio().post(
        '/api/account/fcm-token',
        data: {'fcmToken': token},
        options: Options(
          headers: {'Authorization': 'Bearer $authToken'},
        ),
      );
      debugPrint('✅ FCM token saved to server');
    } catch (e) {
      debugPrint('❌ Save FCM token error: $e');
    }
  }

  Future<void> removeFcmToken() async {
    final authToken = await AuthLocal.getToken();
    if (authToken == null) return;
    try {
      await DioClient.createDio().post(
        '/api/account/remove-fcm-token',
        options: Options(
          headers: {'Authorization': 'Bearer $authToken'},
        ),
      );
      await _fcm.deleteToken();
    } catch (e) {
      debugPrint('❌ Remove FCM token error: $e');
    }
  }

  Future<void> _handleFriendRequestAction(String requestId, bool isAccept, int? notificationId) async {
    final authToken = await AuthLocal.getToken();
    if (authToken == null) {
      debugPrint('❌ Cannot perform friend request action: Auth token is null');
      return;
    }

    final endpoint = isAccept ? '/api/contact/accept' : '/api/contact/reject';
    try {
      final response = await DioClient.createDio().post(
        endpoint,
        data: {'requestId': requestId},
        options: Options(
          headers: {'Authorization': 'Bearer $authToken'},
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('✅ Friend request ${isAccept ? 'accepted' : 'rejected'} successfully');
      }
    } catch (e) {
      debugPrint('❌ Error performing friend request action: $e');
    } finally {
      if (notificationId != null) {
        await _localNotif.cancel(notificationId);
      }
    }
  }
}