import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
class ContactRequestController extends ChangeNotifier {
  final ContactUsecase _usecase;

  List<Map<String, dynamic>> _requests = [];
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get requests => _requests;
  bool get isLoading => _isLoading;
  String? get error => _error;

  ContactRequestController({ContactUsecase? usecase})
      : _usecase = usecase ??
            ContactUsecase(
              ContactRepositoryImp(
                ContactApi(DioClient.createDio()),
              ),
            ) {
    loadRequests();
  }

  Future<void> loadRequests() async {
    _isLoading = true;
    notifyListeners();

    try {
      _requests = await _usecase.getRequests();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> acceptRequest(String requestId) async {
    await _usecase.acceptRequest(requestId);
    _requests.removeWhere((r) => r['_id'] == requestId);
    notifyListeners();
  }

  Future<void> rejectRequest(String requestId) async {
    await _usecase.rejectRequest(requestId);
    _requests.removeWhere((r) => r['_id'] == requestId);
    notifyListeners();
  }

  String getTimeAgo(String createdAt) {
    final time = DateTime.parse(createdAt);
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inSeconds < 60) return '${diff.inSeconds}s';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}d';

    return '${time.day}/${time.month}/${time.year}';
  }
}