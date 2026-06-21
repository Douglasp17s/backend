import 'package:flutter/material.dart';
import 'colores.dart';

class TemaApp {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: ColoresVolt.background,
      primaryColor: ColoresVolt.primary,

      // AppBar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: ColoresVolt.backgroundSecondary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
        iconTheme: const IconThemeData(color: ColoresVolt.textPrimary),
      ),

      // Text Theme
      textTheme: TextTheme(
        displayLarge: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 32,
          fontWeight: FontWeight.bold,
          fontFamily: 'Poppins',
        ),
        displayMedium: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 28,
          fontWeight: FontWeight.bold,
          fontFamily: 'Poppins',
        ),
        displaySmall: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.bold,
          fontFamily: 'Poppins',
        ),
        headlineMedium: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
        headlineSmall: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
        titleLarge: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
        titleMedium: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          fontFamily: 'Poppins',
        ),
        titleSmall: TextStyle(
          color: ColoresVolt.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w500,
          fontFamily: 'Poppins',
        ),
        bodyLarge: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 16,
          fontWeight: FontWeight.normal,
          fontFamily: 'Poppins',
        ),
        bodyMedium: TextStyle(
          color: ColoresVolt.textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.normal,
          fontFamily: 'Poppins',
        ),
        bodySmall: TextStyle(
          color: ColoresVolt.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.normal,
          fontFamily: 'Poppins',
        ),
        labelLarge: TextStyle(
          color: ColoresVolt.primary,
          fontSize: 14,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
        labelMedium: TextStyle(
          color: ColoresVolt.primary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
        labelSmall: TextStyle(
          color: ColoresVolt.textSecondary,
          fontSize: 10,
          fontWeight: FontWeight.w500,
          fontFamily: 'Poppins',
        ),
      ),

      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ColoresVolt.primary,
          foregroundColor: ColoresVolt.background,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
          elevation: 0,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: ColoresVolt.primary,
          side: const BorderSide(color: ColoresVolt.primary, width: 2),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: ColoresVolt.primary,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ColoresVolt.backgroundSecondary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ColoresVolt.borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ColoresVolt.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ColoresVolt.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ColoresVolt.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: ColoresVolt.error, width: 2),
        ),
        hintStyle: TextStyle(
          color: ColoresVolt.textTertiary,
          fontSize: 14,
          fontFamily: 'Poppins',
        ),
        labelStyle: TextStyle(
          color: ColoresVolt.textSecondary,
          fontSize: 14,
          fontFamily: 'Poppins',
        ),
        errorStyle: TextStyle(
          color: ColoresVolt.error,
          fontSize: 12,
          fontFamily: 'Poppins',
        ),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: ColoresVolt.backgroundSecondary,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: ColoresVolt.borderColor),
        ),
      ),

      // Divider Theme
      dividerTheme: DividerThemeData(
        color: ColoresVolt.borderColor,
        thickness: 1,
        space: 16,
      ),

      // Icon Theme
      iconTheme: const IconThemeData(
        color: ColoresVolt.textPrimary,
        size: 24,
      ),

      // Color Scheme
      colorScheme: ColorScheme.dark(
        primary: ColoresVolt.primary,
        onPrimary: ColoresVolt.background,
        secondary: ColoresVolt.primaryDark,
        onSecondary: ColoresVolt.background,
        tertiary: ColoresVolt.info,
        onTertiary: ColoresVolt.background,
        error: ColoresVolt.error,
        onError: ColoresVolt.textPrimary,
        surface: ColoresVolt.backgroundSecondary,
        onSurface: ColoresVolt.textPrimary,
        outline: ColoresVolt.borderColor,
      ),

      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: ColoresVolt.backgroundSecondary,
        selectedColor: ColoresVolt.primary,
        side: const BorderSide(color: ColoresVolt.borderColor),
        labelStyle: TextStyle(
          color: ColoresVolt.textPrimary,
          fontFamily: 'Poppins',
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),

      // BottomSheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: ColoresVolt.backgroundSecondary,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
      ),

      // FloatingActionButton Theme
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: ColoresVolt.primary,
        foregroundColor: ColoresVolt.background,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
