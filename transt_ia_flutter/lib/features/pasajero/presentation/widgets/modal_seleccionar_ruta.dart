import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores.dart';
import '../../../../models/linea.dart';
import '../controllers/rutas_controller.dart';
import 'boton_redondeado.dart';

class ModalSeleccionarRuta extends StatelessWidget {
  final Function(Linea) onSeleccionado;
  final RutasController rutasController = Get.find<RutasController>();

  ModalSeleccionarRuta({
    super.key,
    required this.onSeleccionado,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: ColoresVolt.backgroundSecondary,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Seleccionar Ruta',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: ColoresVolt.textPrimary,
                    fontFamily: 'Poppins',
                  ),
                ),
                GestureDetector(
                  onTap: () => Get.back(),
                  child: Icon(
                    Icons.close,
                    color: ColoresVolt.textPrimary,
                  ),
                ),
              ],
            ),
          ),

          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              onChanged: (value) => rutasController.actualizarBusqueda(value),
              decoration: InputDecoration(
                hintText: 'Buscar linea...',
                hintStyle: TextStyle(color: ColoresVolt.textTertiary),
                prefixIcon: Icon(Icons.search, color: ColoresVolt.primary),
                filled: true,
                fillColor: ColoresVolt.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: ColoresVolt.borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: ColoresVolt.borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: ColoresVolt.primary,
                    width: 2,
                  ),
                ),
              ),
              style: TextStyle(color: ColoresVolt.textPrimary),
            ),
          ),

          // List of routes
          Expanded(
            child: Obx(
              () {
                final lineas = rutasController.lineasFiltradas;

                if (lineas.isEmpty) {
                  return Center(
                    child: Text(
                      'No se encontraron rutas',
                      style: TextStyle(
                        color: ColoresVolt.textSecondary,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: lineas.length,
                  itemBuilder: (context, index) {
                    final linea = lineas[index];
                    final esFavorita = rutasController.esFavorita(linea.id);

                    return GestureDetector(
                      onTap: () {
                        onSeleccionado(linea);
                        Get.back();
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: ColoresVolt.background,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ColoresVolt.borderColor),
                        ),
                        child: Row(
                          children: [
                            // Line number
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: ColoresVolt.primary,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Center(
                                child: Text(
                                  linea.numero,
                                  style: TextStyle(
                                    color: ColoresVolt.background,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Line details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    linea.nombre,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: ColoresVolt.textPrimary,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${linea.origen} - ${linea.destino}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: ColoresVolt.textSecondary,
                                      fontFamily: 'Poppins',
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),

                            // Price and favorite
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Bs. ${linea.precio.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: ColoresVolt.primary,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                GestureDetector(
                                  onTap: () {
                                    if (esFavorita) {
                                      rutasController
                                          .eliminarFavorita(linea.id);
                                    } else {
                                      rutasController.agregarFavorita(linea.id);
                                    }
                                  },
                                  child: Icon(
                                    esFavorita ? Icons.favorite : Icons.favorite_border,
                                    color: esFavorita
                                        ? ColoresVolt.error
                                        : ColoresVolt.textSecondary,
                                    size: 20,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
