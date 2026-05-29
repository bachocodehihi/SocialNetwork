import 'package:flutter/material.dart';
class MainUserController extends ChangeNotifier {
  final int initialIndex;
  MainUserController({this.initialIndex = 0}) {
    currentIndex = initialIndex;
  }
  late int currentIndex;
  void changeTab(int index) {
    if (currentIndex == index) return;
    currentIndex = index;
    notifyListeners();
  }
}