import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color _seed = Color(0xFF4F8CFF);

  static ThemeData _buildTheme(Brightness brightness) {
    final isLight = brightness == Brightness.light;
    //final background = isLight ? Colors.white : const Color(0xFF0F0F0F);

    final scheme = ColorScheme.fromSeed(
      seedColor: _seed,
      brightness: brightness,
    ).copyWith(
      primary: Colors.blue,
      surface: isLight ? Colors.white : const Color(0xFF0F0F0F),
      surfaceDim: isLight ? const Color(0xFFFAFAFA) : const Color(0xFF1B1B1B),
      onSurface: isLight ? Colors.black : Colors.white,
      onSurfaceVariant: isLight ? Colors.grey : Colors.white,

      onPrimary: isLight ? Colors.white : Colors.white,
      surfaceContainerHighest: isLight ? Colors.grey[100] : const Color(0xFF1E1E1E),
      surfaceContainerHigh: isLight ? Colors.white : const Color(0xFF1E1E1E),
      surfaceContainer: isLight ? Colors.white : const Color(0xFF181818),
      surfaceContainerLow: isLight ? const Color(0xFFE9E9E9) : const Color(0xFF141414),
      surfaceContainerLowest: isLight ? const Color(0xFFE2E2E2) : const Color(0xFF0F0F0F),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scheme.surface,
      appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }

  static ThemeData get light => _buildTheme(Brightness.light);

  static ThemeData get dark => _buildTheme(Brightness.dark);
}
