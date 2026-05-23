import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/ip/ip.dart';
import 'package:socialnetwork/data/port/port.dart';


typedef MessageCallback = void Function(Map<String, dynamic> message);
typedef ErrorCallback = void Function(String error);

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  
  SocketService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  String? _currentUserId;
  
  final Map<String, List<Function>> _listeners = {};

  IO.Socket? get socket => _socket;
  bool get isConnected => _isConnected;
  String? get currentUserId => _currentUserId;

  Future<void> connect({VoidCallback? onConnected}) async {
    if (_socket?.connected ?? false) {
      onConnected?.call();
      return;
    }

    final token = await AuthLocal.getToken();
    if (token == null || token.isEmpty) {
      debugPrint('❌ Socket: No auth token');
      return;
    }

    _currentUserId = await AuthLocal.getUserId();

    try {
      _socket = IO.io(
        'http://${IpConfig.currentIp}:${PortConfig.currentPort}',
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .setQuery({'token': token})
            .enableAutoConnect()
            .build(),
      );

      _socket!.onConnect((_) {
        debugPrint('✅ Socket connected');
        _isConnected = true;
        onConnected?.call();
        _emitPendingMessages();
      });

      _socket!.onDisconnect((_) {
        debugPrint('❌ Socket disconnected');
        _isConnected = false;
      });

      _socket!.onConnectError((err) {
        debugPrint('❌ Socket connection error: $err');
        _isConnected = false;
      });

      _socket!.onError((err) {
        debugPrint('❌ Socket error: $err');
        _notifyListeners('error', {'message': err.toString()});
      });

      _socket!.connect();
    } catch (e) {
      debugPrint('❌ Socket init error: $e');
    }
  }

  /// 🔌 Disconnect from server
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _isConnected = false;
    _listeners.clear();
  }

  /// 🚪 Join conversation room
  void joinRoom(String conversationId) {
    if (!_isConnected) {
      debugPrint('⚠️ Cannot join room: Socket not connected');
      return;
    }
    _socket?.emit('join_room', conversationId);
    debugPrint('🔊 Joined room: $conversationId');
  }

  /// 🚶 Leave conversation room
  void leaveRoom(String conversationId) {
    _socket?.emit('leave_room', conversationId);
    debugPrint('🔇 Left room: $conversationId');
  }

  /// 📤 Send message via socket
  void sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    List<Map<String, dynamic>>? attachments,
  }) {
    if (!_isConnected) {
      debugPrint('⚠️ Cannot send: Socket not connected');
      return;
    }
    
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
      'type': type,
      'attachments': attachments ?? [],
    });
  }

  /// ⌨️ Typing indicator
  void sendTyping(String conversationId) {
    if (_isConnected) {
      _socket?.emit('typing', {'conversationId': conversationId});
    }
  }

  /// ⌨️ Stop typing indicator
  void sendStopTyping(String conversationId) {
    if (_isConnected) {
      _socket?.emit('stop_typing', {'conversationId': conversationId});
    }
  }

  /// 👂 Listen for incoming messages
  void onReceiveMessage(MessageCallback callback) {
    _addListener('receive_message', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  /// 👂 Generic event listener
  void on(String event, Function(dynamic) callback) {
    _addListener(event, callback);
  }

  /// 🔕 Remove listener
  void off(String event, [Function(dynamic)? callback]) {
    if (callback != null) {
      _socket?.off(event, callback);
    } else {
      _socket?.off(event);
      _listeners.remove(event);
    }
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  Future<void> reconnect() async {
    disconnect();
    await connect();
  }

  
  void _addListener(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
    
    _listeners.putIfAbsent(event, () => []).add(callback);
  }

  void _notifyListeners(String event, dynamic data) {
    final callbacks = _listeners[event];
    if (callbacks != null) {
      for (final cb in callbacks) {
        try {
          cb(data);
        } catch (e) {
          debugPrint('❌ Listener error: $e');
        }
      }
    }
  }

  final List<Map<String, dynamic>> _pendingMessages = [];
  
  void _emitPendingMessages() {
    for (final msg in _pendingMessages) {
      _socket?.emit('send_message', msg);
    }
    _pendingMessages.clear();
  }
  
  // void _queueMessage(Map<String, dynamic> message) {
  //   _pendingMessages.add(message);
  // }
}