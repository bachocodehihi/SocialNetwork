import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class ActivityController extends ChangeNotifier {
  final _accountApi = AccountApi(DioClient.createDio());

  List<int> weekDayMinutes = [0, 0, 0, 0, 0, 0, 0];
  bool isLoading = true;

  ActivityController() {
    fetchActivity();
  }

  Future<void> fetchActivity() async {
    isLoading = true;
    notifyListeners();

    try {
      final data = await _accountApi.getActivity();
      if (data.isNotEmpty) {
        // Assume backend returns 7 items for last 7 days
        // We need to map them to Mon-Sun for the chart if necessary
        // But the chart expects a list of 7 values.
        // Let's just update the list with the minutes from the backend.
        for (int i = 0; i < data.length && i < 7; i++) {
          weekDayMinutes[i] = data[i]['minutes'] ?? 0;
        }
      }
    } catch (e) {
      debugPrint('Error fetching activity: $e');
    }

    isLoading = false;
    notifyListeners();
  }
  
  int get totalMinutes => weekDayMinutes.fold(0, (a, b) => a + b);
}
