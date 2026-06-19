import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';

class CreateGroupController extends ChangeNotifier {
  final ContactUsecase _contactUsecase;
  final GroupUsecase _groupUsecase;

  final groupNameController = TextEditingController();

  List<Map<String, dynamic>> _friends = [];
  bool _isLoading = false;
  bool _isCreating = false;
  String? _error;
  final Set<String> _selectedIds = {};

  CreateGroupController(this._contactUsecase, this._groupUsecase) {
    groupNameController.addListener(_onNameChanged);
  }

  void _onNameChanged() {
    notifyListeners();
  }

  List<Map<String, dynamic>> get friends => _friends;
  bool get isLoading => _isLoading;
  bool get isCreating => _isCreating;
  String? get error => _error;
  Set<String> get selectedIds => _selectedIds;

  Future<void> fetchFriends() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _contactUsecase.getFriends();
      _friends = data.map((item) => {
        'name': item['username'] ?? item['name'] ?? 'Unknown',
        'avatar': item['avatar'],
        'id': item['_id'] ?? item['id'],
      }).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void toggleSelect(String id) {
    if (_selectedIds.contains(id)) {
      _selectedIds.remove(id);
    } else {
      _selectedIds.add(id);
    }
    notifyListeners();
  }

  void clearSelection() {
    _selectedIds.clear();
    notifyListeners();
  }

  Future<Map<String, dynamic>?> createGroup() async {
    _isCreating = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _groupUsecase.createGroup(
        name: groupNameController.text.trim(),
        members: _selectedIds.toList(),
      );
      return result;
    } catch (e) {
      _error = e.toString();
      return null;
    } finally {
      _isCreating = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    groupNameController.removeListener(_onNameChanged);
    groupNameController.dispose();
    super.dispose();
  }
}