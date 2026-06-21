import 'package:flutter/material.dart';
import '../../../../config/tema/colores_volt.dart';
import '../../models/turno.dart';

/// Tarjeta de ganancias diarias
class TarjetaGanancias extends StatelessWidget {
  final GananciasDia ganancias;
  final VoidCallback? onTap;

  const TarjetaGanancias({
    Key? key,
    required this.ganancias,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final rutaTopGanancias = _obtenerRutaTopGanancias();
    final horaTopGanancias = _obtenerHoraTopGanancias();

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: ColoresVolt.superficie,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ColoresVolt.borde, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ganancias de Hoy',
                style: const TextStyle(
                  color: ColoresVolt.pizarra,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),

              // Total grande
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    'Bs ',
                    style: const TextStyle(
                      color: ColoresVolt.verde,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    ganancias.total.toStringAsFixed(2),
                    style: const TextStyle(
                      color: ColoresVolt.verde,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Desglose
              if (ganancias.porRuta.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ruta con mayores ganancias:',
                      style: const TextStyle(
                        color: ColoresVolt.pizarra,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      rutaTopGanancias,
                      style: const TextStyle(
                        color: ColoresVolt.blanco,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),

              if (ganancias.porHora.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hora pico:',
                      style: const TextStyle(
                        color: ColoresVolt.pizarra,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      horaTopGanancias,
                      style: const TextStyle(
                        color: ColoresVolt.blanco,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _obtenerRutaTopGanancias() {
    if (ganancias.porRuta.isEmpty) return 'N/A';
    final entrada = ganancias.porRuta.entries.reduce(
      (a, b) => a.value > b.value ? a : b,
    );
    return '${entrada.key}: Bs ${entrada.value.toStringAsFixed(2)}';
  }

  String _obtenerHoraTopGanancias() {
    if (ganancias.porHora.isEmpty) return 'N/A';
    final entrada = ganancias.porHora.entries.reduce(
      (a, b) => a.value > b.value ? a : b,
    );
    final hora = entrada.key.toString().padLeft(2, '0');
    return '${hora}:00 - Bs ${entrada.value.toStringAsFixed(2)}';
  }
}
