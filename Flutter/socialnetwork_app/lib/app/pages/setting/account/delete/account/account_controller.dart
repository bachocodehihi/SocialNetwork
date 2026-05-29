import 'package:flutter/material.dart';
class DeleteAccountController extends ChangeNotifier {
  final reasonController = TextEditingController();

  bool _isLoading = false;
  String _errorMessage = '';

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;


}