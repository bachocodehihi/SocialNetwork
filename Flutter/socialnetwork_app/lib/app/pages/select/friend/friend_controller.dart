import 'package:flutter/material.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';

class SelectFriendController extends ChangeNotifier {
  final ContactUsecase _usecase;
  
  List<Map<String, dynamic>> _friends = [];
  final Set<String> _selectedIds = {};
  String _searchQuery = '';
  bool _isLoading = false;
  String? _error;

  SelectFriendController(this._usecase);

  List<Map<String, dynamic>> get friends => _friends;
  Set<String> get selectedIds => _selectedIds;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void initSelectedIds(List<String> initialSelectedIds) {
    _selectedIds.addAll(initialSelectedIds);
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void toggleSelection(String friendId) {
    if (_selectedIds.contains(friendId)) {
      _selectedIds.remove(friendId);
    } else {
      _selectedIds.add(friendId);
    }
    notifyListeners();
  }

  List<Map<String, dynamic>> get filteredFriends {
    if (_searchQuery.isEmpty) return _friends;
    final query = _searchQuery.toLowerCase();
    return _friends.where((friend) {
      final name = friend['name'].toString().toLowerCase();
      return name.contains(query);
    }).toList();
  }

  List<Map<String, dynamic>> get selectedFriends {
    return _friends.where((friend) {
      final String friendId = (friend['id'] ?? friend['_id']).toString();
      return _selectedIds.contains(friendId);
    }).toList();
  }

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
