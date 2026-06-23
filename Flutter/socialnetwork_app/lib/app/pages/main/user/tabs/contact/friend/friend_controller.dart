import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
class ContactFriendController extends ChangeNotifier {
  final ContactUsecase _usecase;
  List<Map<String, dynamic>> _friends = [];
  bool _isLoading = false;
  String? _error;

  ContactFriendController(this._usecase);

  List<Map<String, dynamic>> get friends => _friends;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchFriends() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _usecase.getFriends();
      _friends = data.map((item) {
        final map = Map<String, dynamic>.from(item);
        map['name'] = map['username'] ?? map['name'] ?? 'Unknown';
        map['id'] = map['_id'] ?? map['id'];
        return map;
      }).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}