import 'package:flutter/material.dart';
import '../../../../config/tema/colores.dart';

class TarjetaTrafico extends StatelessWidget {
  final String nivelCongestion;
  final String descripcion;
  final double porcentaje;
  final Color color;

  const TarjetaTrafico({
    super.key,
    required this.nivelCongestion,
    required this.descripcion,
    required this.porcentaje,
    required this.color,
  });

  factory TarjetaTrafico.bajo({required String descripcion}) {
    return TarjetaTrafico(
      nivelCongestion: 'Bajo',
      descripcion: descripcion,
      porcentaje: 0.3,
      color: ColoresVolt.success,
    );
  }

  factory TarjetaTrafico.medio({required String descripcion}) {
    return TarjetaTrafico(
      nivelCongestion: 'Medio',
      descripcion: descripcion,
      porcentaje: 0.6,
      color: ColoresVolt.warning,
    );
  }

  factory TarjetaTrafico.alto({required String descripcion}) {
    return TarjetaTrafico(
      nivelCongestion: 'Alto',
      descripcion: descripcion,
      porcentaje: 0.9,
      color: ColoresVolt.error,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
                'Trafico',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: ColoresVolt.textPrimary,
                  fontFamily: 'Poppins',
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  nivelCongestion,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: color,
                    fontFamily: 'Poppins',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            descripcion,
            style: TextStyle(
              fontSize: 13,
              color: ColoresVolt.textSecondary,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: porcentaje,
              minHeight: 6,
              backgroundColor: ColoresVolt.borderColor,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}
