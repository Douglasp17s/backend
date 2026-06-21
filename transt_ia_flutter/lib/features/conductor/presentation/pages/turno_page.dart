import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores_volt.dart';
import '../controllers/turno_controller.dart';
import '../widgets/boton_redondeado.dart';
import '../widgets/mapa_widget.dart';
import '../widgets/lista_paradas.dart';

/// Página de turno activo con mapa y control de paradas
class TurnoPage extends StatelessWidget {
  const TurnoPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(TurnoController());

    return Scaffold(
      backgroundColor: ColoresVolt.negro,
      appBar: AppBar(
        backgroundColor: ColoresVolt.negro,
        elevation: 0,
        title: const Text(
          'Turno Activo',
          style: TextStyle(
            color: ColoresVolt.blanco,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: ColoresVolt.verde),
          onPressed: () => Get.back(),
        ),
      ),
      body: Obx(
        () {
          if (controller.isLoading.value ||
              controller.turnoActivo.value == null) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(ColoresVolt.verde),
              ),
            );
          }

          final turno = controller.turnoActivo.value!;

          return Stack(
            children: [
              // Mapa
              MapaWidget(
                turno: turno,
                ubicacionActual: controller.ubicacionActual.value,
              ),

              // Ganancia acumulada (esquina superior derecha)
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: ColoresVolt.superficie,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: ColoresVolt.borde,
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: ColoresVolt.negro.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Ganancia Hoy',
                        style: TextStyle(
                          color: ColoresVolt.pizarra,
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Obx(
                        () => Text(
                          'Bs ${controller.gananciaAcumulada.value.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: ColoresVolt.verde,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Tiempo transcurrido (esquina superior izquierda)
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: ColoresVolt.superficie,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: ColoresVolt.borde,
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: ColoresVolt.negro.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tiempo',
                        style: TextStyle(
                          color: ColoresVolt.pizarra,
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Obx(
                        () => Text(
                          controller.tiempoTranscurrido.value,
                          style: const TextStyle(
                            color: ColoresVolt.blanco,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Panel inferior con información y botones
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: MediaQuery.of(context).size.height * 0.4,
                  decoration: BoxDecoration(
                    color: ColoresVolt.negro,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                    border: Border(
                      top: BorderSide(
                        color: ColoresVolt.borde,
                        width: 1,
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Drag handle
                      Padding(
                        padding: const EdgeInsets.only(top: 12, bottom: 12),
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: ColoresVolt.borde,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),

                      // Información de paradas
                      Expanded(
                        child: ListView(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          children: [
                            // Parada actual
                            if (controller.paradaActual.value != null) ...[
                              const Text(
                                'Parada Actual',
                                style: TextStyle(
                                  color: ColoresVolt.pizarra,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ColoresVolt.verdeClaro12,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: ColoresVolt.verde,
                                    width: 2,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: ColoresVolt.verde,
                                        borderRadius:
                                            BorderRadius.circular(20),
                                      ),
                                      child: const Center(
                                        child: Icon(
                                          Icons.location_on,
                                          color: ColoresVolt.negro,
                                          size: 20,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            controller.paradaActual.value!.nombre,
                                            style: const TextStyle(
                                              color: ColoresVolt.blanco,
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Parada ${controller.paradaActual.value!.numeroSecuencia}',
                                            style: const TextStyle(
                                              color: ColoresVolt.pizarra,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Próxima parada
                            if (controller.proximaParada.value != null) ...[
                              const Text(
                                'Próxima Parada',
                                style: TextStyle(
                                  color: ColoresVolt.pizarra,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ColoresVolt.superficie,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: ColoresVolt.borde,
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: ColoresVolt.borde,
                                        borderRadius:
                                            BorderRadius.circular(20),
                                      ),
                                      child: const Center(
                                        child: Icon(
                                          Icons.location_on,
                                          color: ColoresVolt.pizarra,
                                          size: 20,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            controller.proximaParada.value!.nombre,
                                            style: const TextStyle(
                                              color: ColoresVolt.blanco,
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            'Parada ${controller.proximaParada.value!.numeroSecuencia}',
                                            style: const TextStyle(
                                              color: ColoresVolt.pizarra,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],

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

                      // Botones de acción
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: BotonRedondeado(
                                    texto:
                                        'Siguiente Parada',
                                    onPressed: () {
                                      controller
                                          .registrarProximaParada();
                                    },
                                    isLoading: controller
                                        .isLoading.value,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: BotonPeligro(
                                    texto: 'Finalizar Turno',
                                    onPressed: () {
                                      _mostrarDialogoFinalizar(
                                        context,
                                        controller,
                                      );
                                    },
                                    isLoading: controller
                                        .isLoading.value,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _mostrarDialogoFinalizar(
    BuildContext context,
    TurnoController controller,
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
          'Estás a punto de finalizar tu turno. Todos los cambios se guardarán.',
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
              controller.finalizarTurno();
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
}
