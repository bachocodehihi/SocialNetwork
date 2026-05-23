import 'package:flutter/material.dart';
class MainController extends ChangeNotifier {
  final int initialIndex;
  MainController({this.initialIndex = 0}) {
    currentIndex = initialIndex;
  }
  late int currentIndex;
  void changeTab(int index) {
    if (currentIndex == index) return;
    currentIndex = index;
    notifyListeners();
  }
}