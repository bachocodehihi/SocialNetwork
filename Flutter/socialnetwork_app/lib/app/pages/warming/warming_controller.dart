import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class WarmingController extends ChangeNotifier {
  Future<void> returnToHomepage(BuildContext context) async {
    final target = await Routes.getDashboardRoute();
    if (!context.mounted) return;
    Navigator.pushNamedAndRemoveUntil(
      context,
      target,
      (route) => false,
    );
  }
}
