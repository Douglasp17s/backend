import 'package:flutter/material.dart';
import '../../../../config/tema/colores.dart';

class TarjetaETA extends StatelessWidget {
  final String lineaNumero;
  final String etaTexto;
  final double distancia;
  final int personas;
  final VoidCallback onTap;

  const TarjetaETA({
    super.key,
    required this.lineaNumero,
    required this.etaTexto,
    required this.distancia,
    required this.personas,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: ColoresVolt.backgroundSecondary,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: ColoresVolt.borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Linea $lineaNumero',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: ColoresVolt.textPrimary,
                    fontFamily: 'Poppins',
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: ColoresVolt.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    etaTexto,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: ColoresVolt.background,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.location_on, color: ColoresVolt.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '${distancia.toStringAsFixed(1)} km',
                      style: TextStyle(
                        fontSize: 14,
                        color: ColoresVolt.textSecondary,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Icon(Icons.people, color: ColoresVolt.info, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '$personas personas',
                      style: TextStyle(
                        fontSize: 14,
                        color: ColoresVolt.textSecondary,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
