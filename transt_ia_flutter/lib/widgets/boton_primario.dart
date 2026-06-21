import 'package:flutter/material.dart';
import '../config/tema/colores_volt.dart';

/// Botón primario reutilizable
class BotonPrimario extends StatelessWidget {
  final String etiqueta;
  final VoidCallback onPresionado;
  final bool cargando;
  final double? ancho;
  final double alto;

  const BotonPrimario({
    Key? key,
    required this.etiqueta,
    required this.onPresionado,
    this.cargando = false,
    this.ancho,
    this.alto = 48,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: ancho ?? double.infinity,
      height: alto,
      child: ElevatedButton(
        onPressed: cargando ? null : onPresionado,
        style: ElevatedButton.styleFrom(
          backgroundColor: ColoresVolt.verde,
          foregroundColor: ColoresVolt.negro,
          disabledBackgroundColor: ColoresVolt.pizarra.withOpacity(0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: cargando
          ? SizedBox(
              height: 24,
              width: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation(ColoresVolt.negro),
              ),
            )
          : Text(
              etiqueta,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
      ),
    );
  }
}
