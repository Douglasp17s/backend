import 'package:flutter/material.dart';

/// Sistema de colores VoltAgent
/// Paleta de colores oscura con énfasis en verde para Transit AI
class ColoresVolt {
  // Neutros
  static const Color negro = Color(0xFF050507);
  static const Color superficie = Color(0xFF101010);
  static const Color borde = Color(0xFF3d3a39);
  static const Color blanco = Color(0xFFF2F2F2);
  static const Color pergamino = Color(0xFFb8b3b0);
  static const Color pizarra = Color(0xFF8b949e);

  // Primarios
  static const Color verde = Color(0xFF00d992);
  static const Color verdeMenta = Color(0xFF2fd6a1);

  // Semánticos
  static const Color exito = Color(0xFF008b00);
  static const Color advertencia = Color(0xFFffba00);
  static const Color peligro = Color(0xFFfb565b);
  static const Color info = Color(0xFF4cb3d4);

  // Con transparencia
  static final Color verdeClaro12 = verde.withOpacity(0.12);
  static final Color verdeClaro15 = verde.withOpacity(0.15);
  static final Color advertenciaClaro = advertencia.withOpacity(0.12);
  static final Color peligroClaro = peligro.withOpacity(0.12);
  static final Color infoClaro = info.withOpacity(0.12);
}
