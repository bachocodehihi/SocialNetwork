import 'package:flutter/material.dart';

class WarmingController extends ChangeNotifier {
  late DateTime requestTime;
  late DateTime deletionTime;

  WarmingController() {
    requestTime = DateTime.now();
    deletionTime = requestTime.add(const Duration(hours: 24));
  }

  String _formatDateTime(DateTime dt) {
    final hh = dt.hour.toString().padLeft(2, '0');
    final mm = dt.minute.toString().padLeft(2, '0');
    final dd = dt.day.toString().padLeft(2, '0');
    final mo = dt.month.toString().padLeft(2, '0');
    final yr = dt.year;
    return '$hh:$mm, $dd/$mo/$yr';
  }

  String getFormattedRequestTime() {
    return _formatDateTime(requestTime);
  }

  String getFormattedDeletionTime() {
    return _formatDateTime(deletionTime);
  }
}
