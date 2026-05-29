import 'package:flutter/material.dart';
class MainAdminController extends ChangeNotifier {
  final int initialIndex;
  MainAdminController({this.initialIndex = 0}) {
    currentIndex = initialIndex;
  }
  late int currentIndex;
  void changeTab(int index) {
    if (currentIndex == index) return;
    currentIndex = index;
    notifyListeners();
  }
}