import 'package:flutter/material.dart';
import '../../../../config/tema/colores_volt.dart';
import '../../models/turno.dart';

/// Widget que muestra lista de paradas del turno
class ListaParadas extends StatelessWidget {
  final Turno turno;
  final int paradaActualIndex;
  final VoidCallback? onParadaTap;

  const ListaParadas({
    Key? key,
    required this.turno,
    required this.paradaActualIndex,
    this.onParadaTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ColoresVolt.superficie,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        border: Border(
          top: BorderSide(color: ColoresVolt.borde, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: ColoresVolt.borde,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          Text(
            'Paradas de la Ruta',
            style: const TextStyle(
              color: ColoresVolt.blanco,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),

          Expanded(
            child: ListView.separated(
              itemCount: turno.paradas.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final parada = turno.paradas[index];
                final esActual = index == paradaActualIndex;
                final completada = parada.completada;

                return _construirItemParada(
                  parada: parada,
                  esActual: esActual,
                  completada: completada,
                  numero: index + 1,
                  onTap: onParadaTap,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirItemParada({
    required Parada parada,
    required bool esActual,
    required bool completada,
    required int numero,
    VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: esActual ? ColoresVolt.verdeClaro12 : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: esActual ? ColoresVolt.verde : ColoresVolt.borde,
              width: esActual ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              // Número/icono
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _obtenerColorPasetaFondo(completada, esActual),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _obtenerColorPasetaBorde(completada, esActual),
                    width: 2,
                  ),
                ),
                child: Center(
                  child: completada
                      ? const Icon(
                          Icons.check,
                          color: ColoresVolt.verde,
                          size: 20,
                        )
                      : Text(
                          numero.toString(),
                          style: const TextStyle(
                            color: ColoresVolt.blanco,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 12),

              // Información
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      parada.nombre,
                      style: const TextStyle(
                        color: ColoresVolt.blanco,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      completada
                          ? 'Completada - ${_obtenerHoraLlegada(parada)}'
                          : esActual
                              ? 'Parada Actual'
                              : 'Pendiente',
                      style: TextStyle(
                        color: completada ? ColoresVolt.exito : ColoresVolt.pizarra,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              // Pasajeros (si aplica)
              if (parada.pasajerosRecogidos > 0)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Icon(
                      Icons.people,
                      color: ColoresVolt.info,
                      size: 16,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      parada.pasajerosRecogidos.toString(),
                      style: const TextStyle(
                        color: ColoresVolt.info,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
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

  Color _obtenerColorPasetaFondo(bool completada, bool esActual) {
    if (completada) return ColoresVolt.verdeClaro12;
    if (esActual) return ColoresVolt.verdeClaro15;
    return ColoresVolt.borde.withValues(alpha: 0.1);
  }

  Color _obtenerColorPasetaBorde(bool completada, bool esActual) {
    if (completada) return ColoresVolt.verde;
    if (esActual) return ColoresVolt.verde;
    return ColoresVolt.borde;
  }

  String _obtenerHoraLlegada(Parada parada) {
    if (parada.horaLlegada == null) return '';
    final hora = parada.horaLlegada!.hour.toString().padLeft(2, '0');
    final minutos = parada.horaLlegada!.minute.toString().padLeft(2, '0');
    return '$hora:$minutos';
  }
}
