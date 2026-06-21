import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores_volt.dart';
import '../../../../config/rutas/rutas.dart';
import '../controllers/panel_controller.dart';
import '../widgets/boton_redondeado.dart';
import '../widgets/tarjeta_turno.dart';
import '../widgets/tarjeta_ganancias.dart';

/// Panel principal del conductor
class PanelPage extends StatelessWidget {
  const PanelPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(PanelController());

    return Scaffold(
      backgroundColor: ColoresVolt.negro,
      appBar: AppBar(
        backgroundColor: ColoresVolt.negro,
        elevation: 0,
        title: const Text(
          'Panel Conductor',
          style: TextStyle(
            color: ColoresVolt.blanco,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(
              child: Obx(
                () => Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: controller.turnoActivo.value == null
                        ? ColoresVolt.peligroClaro
                        : ColoresVolt.verdeClaro12,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: controller.turnoActivo.value == null
                          ? ColoresVolt.peligro
                          : ColoresVolt.verde,
                      width: 1,
                    ),
                  ),
                  child: Text(
                    controller.obtenerEstadoTexto(),
                    style: TextStyle(
                      color: controller.turnoActivo.value == null
                          ? ColoresVolt.peligro
                          : ColoresVolt.verde,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Obx(
        () {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(ColoresVolt.verde),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => controller.cargarDatos(),
            color: ColoresVolt.verde,
            backgroundColor: ColoresVolt.superficie,
            child: ListView(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                // Mostrar error si existe
                if (controller.errorMensaje.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: ColoresVolt.peligroClaro,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: ColoresVolt.peligro,
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: ColoresVolt.peligro,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            controller.errorMensaje.value,
                            style: const TextStyle(
                              color: ColoresVolt.peligro,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (controller.errorMensaje.isNotEmpty)
                  const SizedBox(height: 16),

                const SizedBox(height: 16),

                // Mostrar turno activo si existe
                if (controller.turnoActivo.value != null) ...[
                  TarjetaTurno(
                    turno: controller.turnoActivo.value!,
                    onTap: () {
                      Get.toNamed(Rutas.turnoActivo);
                    },
                  ),
                  const SizedBox(height: 16),
                  BotonRedondeado(
                    texto: 'Ver Turno en Mapa',
                    onPressed: () {
                      Get.toNamed(Rutas.turnoActivo);
                    },
                    color: ColoresVolt.info,
                    textoColor: ColoresVolt.blanco,
                  ),
                  const SizedBox(height: 12),
                  BotonPeligro(
                    texto: 'Finalizar Turno',
                    onPressed: () {
                      _mostrarDialogoFinalizarTurno(context, controller);
                    },
                  ),
                ] else ...[
                  // Si no hay turno activo, mostrar opciones
                  const Text(
                    'Rutas Disponibles Hoy',
                    style: TextStyle(
                      color: ColoresVolt.blanco,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (controller.rutasDisponibles.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: ColoresVolt.superficie,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: ColoresVolt.borde,
                          width: 1,
                        ),
                      ),
                      child: const Center(
                        child: Text(
                          'No hay rutas asignadas para hoy',
                          style: TextStyle(
                            color: ColoresVolt.pizarra,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: controller.rutasDisponibles.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final ruta = controller.rutasDisponibles[index];
                        return _construirTarjetaRuta(
                          ruta: ruta,
                          onIniciar: () {
                            controller.iniciarTurno(rutaId: ruta.id);
                          },
                          isLoading: controller.isLoading.value,
                        );
                      },
                    ),
                ],

                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  void _mostrarDialogoFinalizarTurno(
    BuildContext context,
    PanelController controller,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: ColoresVolt.superficie,
        title: const Text(
          'Finalizar Turno',
          style: TextStyle(
            color: ColoresVolt.blanco,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: const Text(
          'Estás a punto de finalizar el turno. Confirma que deseas continuar.',
          style: TextStyle(
            color: ColoresVolt.pizarra,
            fontSize: 14,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text(
              'Cancelar',
              style: TextStyle(color: ColoresVolt.verde),
            ),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              // Aquí ir a página de ganancias finales
            },
            child: const Text(
              'Finalizar',
              style: TextStyle(color: ColoresVolt.peligro),
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirTarjetaRuta({
    required dynamic ruta,
    required VoidCallback onIniciar,
    required bool isLoading,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ColoresVolt.superficie,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ColoresVolt.borde, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Línea ${ruta.nombre}',
                style: const TextStyle(
                  color: ColoresVolt.blanco,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                ruta.codigo,
                style: const TextStyle(
                  color: ColoresVolt.pizarra,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${ruta.distanciaKm.toStringAsFixed(1)} km - ${ruta.tiempoEstimadoMinutos} min',
            style: const TextStyle(
              color: ColoresVolt.pizarra,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 12),
          BotonRedondeado(
            texto: 'Iniciar Turno',
            onPressed: onIniciar,
            isLoading: isLoading,
            altura: 44,
          ),
        ],
      ),
    );
  }
}
