import 'package:flutter/material.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'package:socialnetwork/data/service/notification.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class SocketLifecycleHandler extends StatefulWidget {
  final Widget child;
  const SocketLifecycleHandler({super.key, required this.child});

  @override
  State<SocketLifecycleHandler> createState() => _SocketLifecycleHandlerState();
}

class _SocketLifecycleHandlerState extends State<SocketLifecycleHandler>
    with WidgetsBindingObserver {
  final _socketService = SocketService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initServices(); 
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _socketService.disconnect();
    super.dispose();
  }

  Future<void> _initServices() async {
    final token = await AuthLocal.getToken();
    if (token == null || token.isEmpty) return;

    await NotificationService().init();

    final callService = CallService();
    await callService.init();
    callService.onIncomingCall = (callInfo) {
      Navigator.pushNamed(context, Routes.callIncoming);
    };

    await _socketService.connect();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    switch (state) {
      case AppLifecycleState.resumed:
        _initServices();
        break;
      case AppLifecycleState.detached:
        _socketService.disconnect();
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}