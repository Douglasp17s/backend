import 'package:flutter/material.dart';
import '../../../../config/tema/colores.dart';

class BotonRedondeado extends StatelessWidget {
  final String texto;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final double? ancho;
  final double? alto;
  final bool cargando;
  final IconData? icono;
  final MainAxisAlignment alineacion;

  const BotonRedondeado({
    super.key,
    required this.texto,
    required this.onPressed,
    this.backgroundColor,
    this.textColor,
    this.ancho,
    this.alto,
    this.cargando = false,
    this.icono,
    this.alineacion = MainAxisAlignment.center,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: ancho ?? double.infinity,
      height: alto ?? 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(50),
        gradient: LinearGradient(
          colors: [
            backgroundColor ?? ColoresVolt.primary,
            (backgroundColor ?? ColoresVolt.primary).withValues(alpha: 0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: cargando ? null : onPressed,
          borderRadius: BorderRadius.circular(50),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              mainAxisAlignment: alineacion,
              children: [
                if (icono != null) ...[
                  Icon(
                    icono,
                    color: textColor ?? ColoresVolt.background,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                ],
                if (cargando)
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        textColor ?? ColoresVolt.background,
                      ),
                    ),
                  )
                else
                  Text(
                    texto,
                    style: TextStyle(
                      color: textColor ?? ColoresVolt.background,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
