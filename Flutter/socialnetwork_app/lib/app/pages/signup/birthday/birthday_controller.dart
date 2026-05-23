import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
class SignUpBirthdayController extends ChangeNotifier {
  final birthdayController = TextEditingController();

  String _errorMessage = '';
  bool _isLoading = false;

  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  bool validateBirthday() {
    final birthdayText = birthdayController.text.trim();

    if (birthdayText.isEmpty) {
      _errorMessage = 'Please select birthday!';
      notifyListeners();
      return false;
    }

    try {
      final parts = birthdayText.split(' - ');
      final day = int.parse(parts[0]);
      final month = int.parse(parts[1]);
      final year = int.parse(parts[2]);
      final birthday = DateTime(year, month, day);
      
      final today = DateTime.now();

      int age = today.year - birthday.year;
      if (today.month < birthday.month ||
          (today.month == birthday.month && today.day < birthday.day)) {
        age--;
      }

      if (age < 14) {
        _errorMessage = 'You must be at least 14 years old!';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Invalid date format!';
      notifyListeners();
      return false;
    }

    _errorMessage = '';
    notifyListeners();
    return true;
  }

  Future<void> submitBirthday(BuildContext context) async {
    if (!validateBirthday()) return;
    if (!context.mounted) return;
    
    final birthday = birthdayController.text.trim();
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    context.read<SignUpProvider>().setBirthday(birthday);
    if (context.mounted) {
      Navigator.pushNamed(context, Routes.signupGender);
      _isLoading = false; 
      notifyListeners();
    }
  }

  @override
  void dispose() {
    birthdayController.dispose();
    super.dispose();
  }
}