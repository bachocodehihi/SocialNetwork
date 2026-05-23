import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AuthLocal {
  static const _keyToken = 'token';
  static const _keyEmail = 'current_email';
  static const _keySavedEmails = 'saved_emails';
  static const _keyUser = 'current_user';

  static Future<void> saveLogin(String token, String email, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
    await prefs.setString(_keyEmail, email);
    await prefs.setString(_keyUser, jsonEncode(user));

    final saved = prefs.getStringList(_keySavedEmails) ?? [];
    if (!saved.contains(email)) {
      saved.add(email);
      await prefs.setStringList(_keySavedEmails, saved);
    }

    await prefs.setString('user_info_$email', jsonEncode({
      'username': user['username'],
      'avatar': user['avatar'],
      'email': email,
    }));
  }

  static Future<String?> getUserId() async {
    final user = await getCurrentUser();
    return user?['_id'] as String? ?? user?['id'] as String?;
  }

  static Future<Map<String, dynamic>?> getUserInfoByEmail(String email) async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString('user_info_$email');
    if (str == null) return null;
    return jsonDecode(str) as Map<String, dynamic>;
  }

  static Future<List<Map<String, dynamic>>> getSavedAccounts() async {
    final prefs = await SharedPreferences.getInstance();
    final emails = prefs.getStringList(_keySavedEmails) ?? [];
    final accounts = <Map<String, dynamic>>[];
    for (final email in emails) {
      final info = await getUserInfoByEmail(email);
      if (info != null) accounts.add(info);
    }
    return accounts;
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyToken);
  }

  static Future<String?> getCurrentEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyEmail);
  }

  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(_keyUser);
    if (userStr == null) return null;
    return jsonDecode(userStr) as Map<String, dynamic>;
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUser, jsonEncode(user));
  }

  static Future<List<String>> getSavedEmails() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_keySavedEmails) ?? [];
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
    await prefs.remove(_keyEmail);
    await prefs.remove(_keyUser);
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}