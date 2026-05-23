import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
class SignUpAvatarController extends ChangeNotifier {

  XFile? pickedImage;
  String? avatarBase64;
  String _errorMessage = '';
  bool _isLoading = false;
  
  String get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;

  Future<void> pickImage() async {
    try {
      final picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
        maxWidth: 512,
        maxHeight: 512,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        pickedImage = image;
        avatarBase64 = base64Encode(bytes);
        _errorMessage = '';
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Cannot select image. Please try again.';
      notifyListeners();
    }
  }

  Future<void> submitAvatar(BuildContext context) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();
    try {
      if (avatarBase64 != null) {
        context.read<SignUpProvider>().setAvatar(avatarBase64!);
      }
      
      if (context.mounted) {
        await Navigator.pushNamed(context, Routes.signupPassword);
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Something went wrong. Please try again.';
      _isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    pickedImage = null;
    avatarBase64 = null;
    super.dispose();
  }

}