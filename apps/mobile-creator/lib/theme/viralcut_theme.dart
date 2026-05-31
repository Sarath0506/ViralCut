import 'package:flutter/material.dart';

import 'token_colors.dart';

abstract final class ViralCutTheme {
  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final primary = isDark
        ? ViralCutTokenColors.primaryDark
        : ViralCutTokenColors.primaryLight;
    final background = isDark
        ? ViralCutTokenColors.backgroundDark
        : ViralCutTokenColors.backgroundLight;
    final surface = isDark
        ? ViralCutTokenColors.surfaceDark
        : ViralCutTokenColors.surfaceLight;
    final onSurface = isDark
        ? ViralCutTokenColors.onSurfaceDark
        : ViralCutTokenColors.onSurfaceLight;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: primary,
        onPrimary: ViralCutTokenColors.onPrimaryLight,
        secondary: primary,
        onSecondary: ViralCutTokenColors.onPrimaryLight,
        error: isDark
            ? ViralCutTokenColors.errorDark
            : ViralCutTokenColors.errorLight,
        onError: Colors.white,
        surface: surface,
        onSurface: onSurface,
      ),
      scaffoldBackgroundColor: background,
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: onSurface,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }
}
