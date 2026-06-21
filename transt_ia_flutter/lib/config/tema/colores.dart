import 'package:flutter/material.dart';

class ColoresVolt {
  // Primary colors
  static const Color primary = Color(0xFF00d992);      // Verde electrónico
  static const Color primaryDark = Color(0xFF00a86d);  // Verde oscuro
  static const Color primaryLight = Color(0xFF33e6a8); // Verde claro

  // Background colors
  static const Color background = Color(0xFF0f0f0f);    // Negro profundo
  static const Color backgroundSecondary = Color(0xFF1a1a1a); // Negro secundario
  static const Color backgroundTertiary = Color(0xFF2d2d2d);  // Negro terciario

  // Text colors
  static const Color textPrimary = Color(0xFFe0e0e0);  // Gris claro
  static const Color textSecondary = Color(0xFFb0b0b0); // Gris medio
  static const Color textTertiary = Color(0xFF808080);  // Gris oscuro

  // Status colors
  static const Color success = Color(0xFF00d992);      // Verde (éxito)
  static const Color error = Color(0xFFff4444);        // Rojo (error)
  static const Color warning = Color(0xFFffa500);      // Naranja (advertencia)
  static const Color info = Color(0xFF00bfff);         // Azul (información)

  // Overlay & Border colors
  static const Color overlayLight = Color(0x1ae0e0e0);  // Overlay claro 10%
  static const Color overlayMedium = Color(0x4de0e0e0); // Overlay medio 30%
  static const Color overlayDark = Color(0x80e0e0e0);   // Overlay oscuro 50%

  static const Color borderColor = Color(0xFF404040);   // Borde oscuro
  static const Color borderLight = Color(0xFF555555);   // Borde claro

  // Shadow color
  static const Color shadowColor = Color(0xFF000000);

  // Gradients
  static const List<Color> primaryGradient = [
    Color(0xFF00d992),
    Color(0xFF00a86d),
  ];

  static const List<Color> darkGradient = [
    Color(0xFF1a1a1a),
    Color(0xFF0f0f0f),
  ];
}
