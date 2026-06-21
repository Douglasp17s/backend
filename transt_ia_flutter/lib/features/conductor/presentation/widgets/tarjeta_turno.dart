import 'package:flutter/material.dart';
import '../../../../config/tema/colores_volt.dart';
import '../../models/turno.dart';

/// Tarjeta que muestra información del turno actual
class TarjetaTurno extends StatelessWidget {
  final Turno turno;
  final VoidCallback? onTap;

  const TarjetaTurno({
    Key? key,
    required this.turno,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final progreso = turno.obtenerProgreso();
    final duracion = turno.obtenerDuracion();
    final horas = duracion.inHours;
    final minutos = duracion.inMinutes % 60;

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
              // Encabezado: Línea y Estado
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Línea ${turno.linea}',
                    style: const TextStyle(
                      color: ColoresVolt.blanco,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _obtenerColorEstado().withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: _obtenerColorEstado(),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      _obtenerTextoEstado(),
                      style: TextStyle(
                        color: _obtenerColorEstado(),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Ganancias
              Text(
                'Ganancia hoy: Bs ${turno.gananciaTotal.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: ColoresVolt.verde,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              // Progreso de paradas
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Paradas: ${turno.paradasCompletadas}/${turno.paradasTotales}',
                    style: const TextStyle(
                      color: ColoresVolt.pizarra,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    '${(progreso * 100).toStringAsFixed(0)}%',
                    style: const TextStyle(
                      color: ColoresVolt.verde,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progreso,
                  minHeight: 6,
                  backgroundColor: ColoresVolt.borde,
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    ColoresVolt.verde,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Tiempo transcurrido
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Tiempo: ${horas}h ${minutos}m',
                    style: const TextStyle(
                      color: ColoresVolt.pizarra,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    'Inicio: ${_obtenerHoraInicio()}',
                    style: const TextStyle(
                      color: ColoresVolt.pizarra,
                      fontSize: 12,
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

  Color _obtenerColorEstado() {
    switch (turno.estado) {
      case 'INICIADO':
        return ColoresVolt.info;
      case 'EN_RUTA':
        return ColoresVolt.verde;
      case 'COMPLETADO':
        return ColoresVolt.exito;
      case 'CANCELADO':
        return ColoresVolt.peligro;
      default:
        return ColoresVolt.pizarra;
    }
  }

  String _obtenerTextoEstado() {
    switch (turno.estado) {
      case 'INICIADO':
        return 'Iniciado';
      case 'EN_RUTA':
        return 'En Ruta';
      case 'COMPLETADO':
        return 'Completado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return turno.estado;
    }
  }

  String _obtenerHoraInicio() {
    final hora = turno.fechaInicio.hour.toString().padLeft(2, '0');
    final minutos = turno.fechaInicio.minute.toString().padLeft(2, '0');
    return '$hora:$minutos';
  }
}
