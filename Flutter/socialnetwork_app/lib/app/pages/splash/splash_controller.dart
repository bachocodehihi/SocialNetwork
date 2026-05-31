import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class SplashController {
  final ValueNotifier<bool> showLogo = ValueNotifier(false);

  void init(void Function(String targetRoute) onNavigate) {
    Future.delayed(const Duration(seconds: 1), () {
      showLogo.value = true;
    });

    Future.delayed(const Duration(seconds: 2), () async {
      final isLoggedIn = await AuthLocal.isLoggedIn();
      if (isLoggedIn) {
        final route = await Routes.getDashboardRoute();
        onNavigate(route);
      } else {
        onNavigate(Routes.wellcome);
      }
    });
  }

  void dispose() {
    showLogo.dispose();
  }
}