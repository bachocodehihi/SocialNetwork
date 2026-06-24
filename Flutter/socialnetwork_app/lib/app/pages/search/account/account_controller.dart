import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/repositories/account_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class SearchAccountController extends ChangeNotifier {
  final AccountUsecase _usecase;
  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> _results = [];
  List<Map<String, dynamic>> _recentUsers = [];
  bool _isLoading = false;
  String? _error;
  Timer? _debounce;

  List<Map<String, dynamic>> get results => _results;
  List<Map<String, dynamic>> get recentUsers => _recentUsers;
  bool get isLoading => _isLoading;
  String? get error => _error;

  SearchAccountController({AccountUsecase? usecase})
    : _usecase = usecase ??
      AccountUsecase(
        AccountRepositoryImp(
          AccountApi(DioClient.createDio()),
        ),
      ) {
    _loadRecentUsers();
  }

  void onSearchChanged(String query) {
    _debounce?.cancel();

    if (query.trim().isEmpty) {
      _results.clear();
      _error = null;
      notifyListeners();
      return;
    }

    _debounce = Timer(const Duration(milliseconds: 500), () {
      _searchUsers(query.trim());
    });
  }
  
  Future<void> _searchUsers(String query) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await _usecase.searchUsers(query);
      _results = results;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveRecentUser(Map<String, dynamic> user) async {
    final searchedUserId = user['_id']?.toString() ?? user['id']?.toString();
    if (searchedUserId == null) return;

    _recentUsers.removeWhere((u) {
      final id = u['_id']?.toString() ?? u['id']?.toString();
      return id == searchedUserId;
    });
    _recentUsers.insert(0, user);
    notifyListeners();

    try {
      await _usecase.saveSearchHistory(searchedUserId);
    } catch (e) {
      //
    }
  }

  Future<void> _loadRecentUsers() async {
    try {
      _recentUsers = await _usecase.getSearchHistory();
      notifyListeners();
    } catch (e) {
      _recentUsers = [];
    }
  }

  Future<void> removeRecentUser(Map<String, dynamic> user) async {
    final searchedUserId = user['_id']?.toString() ?? user['id']?.toString();
    if (searchedUserId == null) return;

    _recentUsers.removeWhere((u) {
      final id = u['_id']?.toString() ?? u['id']?.toString();
      return id == searchedUserId;
    });
    notifyListeners();

    try {
      await _usecase.deleteSearchHistory(searchedUserId);
    } catch (e) {
      //
    }
  }

  Future<void> clearRecentUsers() async {
    _recentUsers.clear();
    notifyListeners();

    try {
      await _usecase.clearSearchHistory();
    } catch (e) {
      //
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }
}