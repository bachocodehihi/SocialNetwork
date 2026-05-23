// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import '../controllers/call_controller.dart';
// import '../services/call_socket_service.dart';
// import '../views/call_in_coming_view.dart'; 

// class GlobalCallListener extends StatefulWidget {
//   final Widget child;
//   const GlobalCallListener({super.key, required this.child});

//   @override
//   State<GlobalCallListener> createState() => _GlobalCallListenerState();
// }

// class _GlobalCallListenerState extends State<GlobalCallListener> {
//   final _callSocket = CallSocketService();

//   @override
//   void initState() {
//     super.initState();
//     _initListener();
//   }

//   void _initListener() {
//     _callSocket.init();

//     _callSocket.onIncomingCall = (callData) {
//       final currentRoute = ModalRoute.of(context)?.settings.name ?? '';
//       if (currentRoute.contains('call')) return;

//       Navigator.push(
//         context,
//         MaterialPageRoute(
//           builder: (_) => const CallInComingView(),
//           fullscreenDialog: true,
//         ),
//       );
//     };
//   }

//   @override
//   Widget build(BuildContext context) => widget.child;
// }