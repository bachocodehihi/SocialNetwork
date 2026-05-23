import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
class SplashController {
  final ValueNotifier<bool> showLogo = ValueNotifier(false);

  void init(void Function(bool isLoggedIn) onNavigate) {
    Future.delayed(const Duration(seconds: 1), () {
      showLogo.value = true;
    });

    Future.delayed(const Duration(seconds: 2), () async {
      final isLoggedIn = await AuthLocal.isLoggedIn();
      onNavigate(isLoggedIn);
    });
  }

  void dispose() {
    showLogo.dispose();
  }
}