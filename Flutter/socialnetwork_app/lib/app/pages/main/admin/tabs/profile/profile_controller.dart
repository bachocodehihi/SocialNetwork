import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

class ProfileAdminController extends ChangeNotifier {
  Map<String, dynamic>? user;

  ProfileAdminController() {
    loadUser();
  }

  Future<void> loadUser() async {
    user = await AuthLocal.getCurrentUser();
    notifyListeners();
  }
  
  int get friendsCount => user?['stats']?['friendsCount'] ?? 0;
  int get followersCount => user?['stats']?['followersCount'] ?? 0;
  int get followingCount => user?['stats']?['followingCount'] ?? 0;

  String get username => user?['username'] ?? '';
  String get avatar => user?['avatar'] ?? '';
  String get email => user?['email'] ?? '';

  String get birthday {
    final raw = user?['birthday'];
    if (raw == null || raw.isEmpty) return '';
    try {
      final date = DateTime.parse(raw);
      return '${date.day.toString().padLeft(2, '0')} - ${date.month.toString().padLeft(2, '0')} - ${date.year}';
    } catch (_) {
      return raw;
    }
  }
  
  String get gender => user?['gender'] ?? '';

  String get address => user?['address'] ?? '';
  String get phone => user?['phone'] ?? '';
  String get job => user?['job'] ?? '';
  String get nationality => user?['nationality'] ?? '';

  void goToFriends(BuildContext context) {
    Navigator.pushNamed(context, Routes.friend);
  }

  void goToFollowing(BuildContext context) {
    Navigator.pushNamed(context, Routes.following);
  }

  void goToFollowers(BuildContext context) {
    Navigator.pushNamed(context, Routes.follower);
  }

  void goToQRCode(BuildContext context) {
    Navigator.pushNamed(context, Routes.code);
  }

  void goToAdd(BuildContext context) async {
    await Navigator.pushNamed(context, Routes.add);
    await loadUser();
  }
}