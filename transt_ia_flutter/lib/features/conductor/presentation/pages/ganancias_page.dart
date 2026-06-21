import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores_volt.dart';
import '../controllers/ganancias_controller.dart';

/// Página de análisis de ganancias
class GananciasPage extends StatelessWidget {
  const GananciasPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(GananciasController());

    return Scaffold(
      backgroundColor: ColoresVolt.negro,
      appBar: AppBar(
        backgroundColor: ColoresVolt.negro,
        elevation: 0,
        title: const Text(
          'Mis Ganancias',
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
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(ColoresVolt.verde),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => controller.cargarGanancias(),
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

                // Ganancias de hoy
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: ColoresVolt.verdeClaro15,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: ColoresVolt.verde,
                      width: 2,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Ganancias Hoy',
                        style: TextStyle(
                          color: ColoresVolt.pizarra,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          const Text(
                            'Bs ',
                            style: TextStyle(
                              color: ColoresVolt.verde,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            controller.gananciaHoy.value.total
                                .toStringAsFixed(2),
                            style: const TextStyle(
                              color: ColoresVolt.verde,
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                        children: [
                          _construirEstadistica(
                            titulo: 'Rutas',
                            valor: controller
                                .gananciaHoy.value.porRuta.length
                                .toString(),
                          ),
                          _construirEstadistica(
                            titulo: 'Promedio/Hora',
                            valor:
                                'Bs ${(controller.gananciaHoy.value.total / 8).toStringAsFixed(2)}',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Comparación con período anterior
                if (controller.gananciasHistorico.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: ColoresVolt.superficie,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: ColoresVolt.borde,
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Estadísticas',
                          style: TextStyle(
                            color: ColoresVolt.blanco,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            _construirCardEstadistica(
                              titulo: 'Promedio',
                              valor: 'Bs ${controller.obtenerPromedioGanancias().toStringAsFixed(2)}',
                              color: ColoresVolt.info,
                            ),
                            _construirCardEstadistica(
                              titulo: 'Máximo',
                              valor: 'Bs ${controller.obtenerGananciaMaxima().toStringAsFixed(2)}',
                              color: ColoresVolt.exito,
                            ),
                            _construirCardEstadistica(
                              titulo: 'Mínimo',
                              valor: 'Bs ${controller.obtenerGananciaMinima().toStringAsFixed(2)}',
                              color: ColoresVolt.advertencia,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Ruta con mayores ganancias
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: ColoresVolt.superficie,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: ColoresVolt.borde,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Mejor Ruta Hoy',
                        style: TextStyle(
                          color: ColoresVolt.blanco,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        controller.obtenerRutaTopGanancias(),
                        style: const TextStyle(
                          color: ColoresVolt.verde,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Hora pico
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: ColoresVolt.superficie,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: ColoresVolt.borde,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Hora Pico',
                        style: TextStyle(
                          color: ColoresVolt.blanco,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        controller.obtenerHoraTopGanancias(),
                        style: const TextStyle(
                          color: ColoresVolt.advertencia,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Período de visualización
                const Text(
                  'Historial',
                  style: TextStyle(
                    color: ColoresVolt.blanco,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _construirBotonPeriodo(
                        label: '7 días',
                        seleccionado: controller.diasMostrados.value == 7,
                        onPressed: () => controller.cambiarPeriodo(7),
                      ),
                      const SizedBox(width: 8),
                      _construirBotonPeriodo(
                        label: '14 días',
                        seleccionado: controller.diasMostrados.value == 14,
                        onPressed: () => controller.cambiarPeriodo(14),
                      ),
                      const SizedBox(width: 8),
                      _construirBotonPeriodo(
                        label: '30 días',
                        seleccionado: controller.diasMostrados.value == 30,
                        onPressed: () => controller.cambiarPeriodo(30),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Gráfico simple (barras)
                if (controller.gananciasHistorico.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: ColoresVolt.superficie,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: ColoresVolt.borde,
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Ganancias por Día',
                          style: TextStyle(
                            color: ColoresVolt.blanco,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 180,
                          child: Row(
                            mainAxisAlignment:
                                MainAxisAlignment.spaceEvenly,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: List.generate(
                              controller.gananciasHistorico.length,
                              (index) {
                                final ganancia = controller
                                    .gananciasHistorico[index];
                                final maxGanancia = controller
                                    .obtenerGananciaMaxima();
                                final altura = (ganancia.total /
                                        maxGanancia) *
                                    140;
                                final dia = ganancia.fecha.day;

                                return Column(
                                  mainAxisAlignment:
                                      MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      'Bs ${ganancia.total.toStringAsFixed(0)}',
                                      style: const TextStyle(
                                        color: ColoresVolt
                                            .pizarra,
                                        fontSize: 10,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      width: 24,
                                      height: altura,
                                      decoration: BoxDecoration(
                                        color:
                                            ColoresVolt.verde,
                                        borderRadius:
                                            BorderRadius
                                                .circular(4),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      dia.toString(),
                                      style: const TextStyle(
                                        color: ColoresVolt
                                            .pizarra,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _construirEstadistica({
    required String titulo,
    required String valor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          titulo,
          style: const TextStyle(
            color: ColoresVolt.pizarra,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          valor,
          style: const TextStyle(
            color: ColoresVolt.blanco,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _construirCardEstadistica({
    required String titulo,
    required String valor,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              titulo,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              valor,
              style: const TextStyle(
                color: ColoresVolt.blanco,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _construirBotonPeriodo({
    required String label,
    required bool seleccionado,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: seleccionado
                ? ColoresVolt.verde
                : ColoresVolt.superficie,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: seleccionado
                  ? ColoresVolt.verde
                  : ColoresVolt.borde,
              width: 1,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: seleccionado
                  ? ColoresVolt.negro
                  : ColoresVolt.blanco,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
