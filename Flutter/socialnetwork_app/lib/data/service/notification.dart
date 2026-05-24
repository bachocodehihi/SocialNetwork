
// import 'dart:convert';
// import 'package:dio/dio.dart';
// import 'package:firebase_core/firebase_core.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';
// import 'package:flutter/foundation.dart';
// import 'package:flutter_local_notifications/flutter_local_notifications.dart';
// import 'package:socialnetwork/data/local/auth_local.dart';
// import 'package:socialnetwork/data/network/dio_client.dart';

// @pragma('vm:entry-point')
// Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
//   await Firebase.initializeApp();
//   await NotificationService.showNotificationFromMessage(message);
// }

// class NotificationService {
//   static final NotificationService _instance = NotificationService._internal();
//   factory NotificationService() => _instance;
//   NotificationService._internal();

//   final _fcm = FirebaseMessaging.instance;
//   final _localNotif = FlutterLocalNotificationsPlugin();

//   static const _chatChannelId = 'chat_channel';
//   static const _callChannelId = 'call_channel';
//   static const _generalChannelId = 'general_channel';

//   // Callback khi user tap thông báo
//   void Function(Map<String, dynamic> data)? onNotificationTap;

//   // ─── INIT ─────────────────────────────────────────────────────────────────
//   Future<void> init() async {
//     // 1. Xin quyền
//     await _fcm.requestPermission(
//       alert: true,
//       badge: true,
//       sound: true,
//     );

//     await _setupLocalNotifications();

//     FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

//     FirebaseMessaging.onMessage.listen((message) {
//       debugPrint('📬 Foreground message: ${message.data}');
//       showNotificationFromMessage(message);
//     });

//     FirebaseMessaging.onMessageOpenedApp.listen((message) {
//       debugPrint('👆 Notification tapped (background): ${message.data}');
//       onNotificationTap?.call(message.data);
//     });

//     final initial = await _fcm.getInitialMessage();
//     if (initial != null) {
//       debugPrint('👆 Notification tapped (killed): ${initial.data}');
    
//       await Future.delayed(const Duration(seconds: 1));
//       onNotificationTap?.call(initial.data);
//     }

//     await _saveFcmToken();

//     _fcm.onTokenRefresh.listen((token) async {
//       debugPrint('🔄 FCM token refreshed');
//       await _sendTokenToServer(token);
//     });

//     debugPrint('✅ NotificationService initialized');
//   }

//   Future<void> _setupLocalNotifications() async {
//     const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
//     const iosInit = DarwinInitializationSettings(
//       requestAlertPermission: true,
//       requestBadgePermission: true,
//       requestSoundPermission: true,
//     );

//     await _localNotif.initialize(
//       const InitializationSettings(android: androidInit, iOS: iosInit),
//       onDidReceiveNotificationResponse: (details) {
//         if (details.payload != null) {
//           try {
//             final data = jsonDecode(details.payload!);
//             onNotificationTap?.call(data);
//           } catch (_) {}
//         }
//       },
//     );

//     final android = _localNotif.resolvePlatformSpecificImplementation<
//         AndroidFlutterLocalNotificationsPlugin>();

//     await android?.createNotificationChannel(const AndroidNotificationChannel(
//       _chatChannelId,
//       'Tin nhắn',
//       description: 'Thông báo tin nhắn mới',
//       importance: Importance.high,
//       playSound: true,
//       enableVibration: true,
//     ));

//     await android?.createNotificationChannel(const AndroidNotificationChannel(
//       _callChannelId,
//       'Cuộc gọi',
//       description: 'Thông báo cuộc gọi đến',
//       importance: Importance.max,
//       playSound: true,
//       enableVibration: true,
//     ));

//     await android?.createNotificationChannel(const AndroidNotificationChannel(
//       _generalChannelId,
//       'Thông báo chung',
//       description: 'Thông báo khác',
//       importance: Importance.defaultImportance,
//     ));
//   }

//   static Future<void> showNotificationFromMessage(RemoteMessage message) async {
//     final localNotif = FlutterLocalNotificationsPlugin();

//     const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
//     const iosInit = DarwinInitializationSettings();
//     await localNotif.initialize(
//       const InitializationSettings(android: androidInit, iOS: iosInit),
//     );

//     final data = message.data;
//     final notif = message.notification;
//     final type = data['type'] ?? 'general';

//     String channelId;
//     Importance importance;
//     Priority priority;

//     switch (type) {
//       case 'call':
//         channelId = _callChannelId;
//         importance = Importance.max;
//         priority = Priority.max;
//         break;
//       case 'message':
//         channelId = _chatChannelId;
//         importance = Importance.high;
//         priority = Priority.high;
//         break;
//       default:
//         channelId = _generalChannelId;
//         importance = Importance.defaultImportance;
//         priority = Priority.defaultPriority;
//     }

//     final senderAvatar = data['senderAvatar'] as String? ?? '';
//     AndroidNotificationDetails androidDetails;

//     if (senderAvatar.isNotEmpty) {
//       androidDetails = AndroidNotificationDetails(
//         channelId,
//         _channelName(channelId),
//         importance: importance,
//         priority: priority,
//         styleInformation: const BigTextStyleInformation(''),
//         largeIcon: FilePathAndroidBitmap(senderAvatar),
//         groupKey: data['conversationId'] ?? 'general',
//         icon: '@mipmap/ic_launcher',
//       );
//     } else {
//       androidDetails = AndroidNotificationDetails(
//         channelId,
//         _channelName(channelId),
//         importance: importance,
//         priority: priority,
//         styleInformation: const BigTextStyleInformation(''),
//         groupKey: data['conversationId'] ?? 'general',
//         icon: '@mipmap/ic_launcher',
//       );
//     }

//     const iosDetails = DarwinNotificationDetails(
//       presentAlert: true,
//       presentBadge: true,
//       presentSound: true,
//     );

//     await localNotif.show(
//       message.hashCode,
//       notif?.title ?? _defaultTitle(type),
//       notif?.body ?? '',
//       NotificationDetails(android: androidDetails, iOS: iosDetails),
//       payload: jsonEncode(data),
//     );
//   }

//   static String _channelName(String id) {
//     switch (id) {
//       case _chatChannelId: return 'Tin nhắn';
//       case _callChannelId: return 'Cuộc gọi';
//       default: return 'Thông báo chung';
//     }
//   }

//   static String _defaultTitle(String type) {
//     switch (type) {
//       case 'call': return 'Cuộc gọi đến';
//       case 'message': return 'Tin nhắn mới';
//       default: return 'Thông báo';
//     }
//   }

//   Future<void> _saveFcmToken() async {
//     final token = await _fcm.getToken();
//     if (token != null) {
//       debugPrint('📱 FCM Token: ${token.substring(0, 20)}...');
//       await _sendTokenToServer(token);
//     }
//   }

//   Future<void> _sendTokenToServer(String token) async {
//     final authToken = await AuthLocal.getToken();
//     if (authToken == null) return;
//     try {
//       await DioClient.createDio().post(
//         '/api/account/fcm-token',
//         data: {'fcmToken': token},
//         options: Options(
//           headers: {'Authorization': 'Bearer $authToken'},
//         ),
//       );
//       debugPrint('✅ FCM token saved to server');
//     } catch (e) {
//       debugPrint('❌ Save FCM token error: $e');
//     }
//   }

//   Future<void> removeFcmToken() async {
//     final authToken = await AuthLocal.getToken();
//     if (authToken == null) return;
//     try {
//       await DioClient.createDio().post(
//         '/api/account/remove-fcm-token',
//         options: Options(
//           headers: {'Authorization': 'Bearer $authToken'},
//         ),
//       );
//       await _fcm.deleteToken();
//     } catch (e) {
//       debugPrint('❌ Remove FCM token error: $e');
//     }
//   }
// }



// lib/data/service/notification_service.dart
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

// ✅ Top-level — xử lý khi app bị KILL
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  // Bỏ showNotificationFromMessage ở background/kill để tránh trùng lặp thông báo với HĐH
  debugPrint('📬 Background message received in handler: ${message.messageId}');
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

  // ─── INIT ─────────────────────────────────────────────────────────────────
  Future<void> init() async {
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Request Android 13+ Notification Permission at runtime
    if (defaultTargetPlatform == TargetPlatform.android) {
      final androidImplementation = _localNotif.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      await androidImplementation?.requestNotificationsPermission();
    }

    // Enable foreground notification display on iOS
    await _fcm.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    await _setupLocalNotifications();

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // ✅ App đang foreground — show local notification
    FirebaseMessaging.onMessage.listen((message) {
      debugPrint('📬 Foreground message: ${message.data}');
      showNotificationFromMessage(message);
    });

    // ✅ User tap khi app background
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('👆 Tapped (background): ${message.data}');
      onNotificationTap?.call(message.data);
    });

    // ✅ User tap khi app bị kill (cold start)
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

  // ─── LOCAL NOTIFICATIONS SETUP ────────────────────────────────────────────
  Future<void> _setupLocalNotifications() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    await _localNotif.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
      onDidReceiveNotificationResponse: (details) {
        if (details.payload != null) {
          try {
            final data = jsonDecode(details.payload!);
            onNotificationTap?.call(data);
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

  // ─── SHOW NOTIFICATION ────────────────────────────────────────────────────
  static Future<void> showNotificationFromMessage(RemoteMessage message) async {
    final localNotif = FlutterLocalNotificationsPlugin();

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    await localNotif.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
    );

    final data = message.data;
    final type = data['type'] ?? 'general';

    // ✅ Lấy title/body từ data (backend gửi trong data field)
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

    final androidDetails = AndroidNotificationDetails(
      channelId,
      _channelName(channelId),
      importance: importance,
      priority: priority,
      styleInformation: BigTextStyleInformation(body),
      groupKey: data['conversationId'] ?? 'general',
      icon: '@mipmap/ic_launcher',
      // ✅ ID unique để không bị trùng
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    // ✅ ID unique theo thời gian — tránh duplicate
    final notifId = DateTime.now().millisecondsSinceEpoch ~/ 1000;

    await localNotif.show(
      notifId,
      title,
      body,
      NotificationDetails(android: androidDetails, iOS: iosDetails),
      payload: jsonEncode(data),
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

  // ─── FCM TOKEN ────────────────────────────────────────────────────────────
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
}