import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/repositories/account_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'dart:convert';

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
    final userId = user['id']?.toString() ?? user['username']?.toString();
    if (userId == null) return;

    _recentUsers.removeWhere((u) {
      final id = u['id']?.toString() ?? u['username']?.toString();
      return id == userId;
    });

    _recentUsers.insert(0, user);

    if (_recentUsers.length > 10) {
      _recentUsers.removeLast();
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = _recentUsers.map((u) => jsonEncode(u)).toList();
      await prefs.setStringList('recent_users', encoded);
      notifyListeners();
    } catch (e) {
      //
    }
  }

  Future<void> _loadRecentUsers() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getStringList('recent_users') ?? [];
      _recentUsers = raw
          .map((s) => Map<String, dynamic>.from(jsonDecode(s)))
          .toList();
      notifyListeners();
    } catch (e) {
      _recentUsers = [];
    }
  }

  Future<void> removeRecentUser(Map<String, dynamic> user) async {
    final userId = user['id']?.toString() ?? user['username']?.toString();
    _recentUsers.removeWhere((u) {
      final id = u['id']?.toString() ?? u['username']?.toString();
      return id == userId;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = _recentUsers.map((u) => jsonEncode(u)).toList();
      await prefs.setStringList('recent_users', encoded);
      notifyListeners();
    } catch (e) {
      //
    }
  }

  Future<void> clearRecentUsers() async {
    _recentUsers.clear();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('recent_users', []);
      notifyListeners();
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