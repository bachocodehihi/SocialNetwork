import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class ScannerController extends ChangeNotifier {
  bool _isFlashOn = false;
  bool _isFrontCamera = false;
  bool _isScanning = true;
  bool _isLoading = false;
  String? _errorMessage;

  bool get isFlashOn => _isFlashOn;
  bool get isFrontCamera => _isFrontCamera;
  bool get isScanning => _isScanning;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void toggleFlash() {
    _isFlashOn = !_isFlashOn;
    notifyListeners();
  }

  void toggleCamera() {
    _isFrontCamera = !_isFrontCamera;
    notifyListeners();
  }

  void pauseScanning() {
    _isScanning = false;
    notifyListeners();
  }

  void resumeScanning() {
    _isScanning = true;
    _errorMessage = null;
    notifyListeners();
  }

  void setError(String message) {
    _errorMessage = message;
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> fetchUserByQrCode(String qrValue) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final contactUsecase = ContactUsecase(
        ContactRepositoryImp(ContactApi(DioClient.createDio())),
      );
      final userData = await contactUsecase.getUserById(qrValue);
      _isLoading = false;
      notifyListeners();
      return userData;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Không tìm thấy người dùng';
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> fetchGroupByInviteCode(String inviteCode) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final groupUsecase = GroupUsecase(
        GroupRepositoryImp(GroupApi(DioClient.createDio())),
      );
      final groupData = await groupUsecase.getGroupByInviteCode(inviteCode);
      _isLoading = false;
      notifyListeners();
      return groupData;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Không tìm thấy thông tin nhóm';
      notifyListeners();
      return null;
    }
  }
}