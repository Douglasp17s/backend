import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../config/tema/colores.dart';
import '../../../../config/rutas/app_routes.dart';
import '../controllers/mapa_controller.dart';
import '../controllers/rutas_controller.dart';
import '../widgets/boton_redondeado.dart';
import '../widgets/mapa_widget.dart';
import '../widgets/modal_seleccionar_ruta.dart';
import '../widgets/tarjeta_eta.dart';
import '../widgets/tarjeta_trafico.dart';

class MapaPage extends StatefulWidget {
  const MapaPage({super.key});

  @override
  State<MapaPage> createState() => _MapaPageState();
}

class _MapaPageState extends State<MapaPage> {
  late MapaController mapaController;
  late RutasController rutasController;

  @override
  void initState() {
    super.initState();
    mapaController = Get.put(MapaController());
    rutasController = Get.put(RutasController());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColoresVolt.background,
      body: Stack(
        children: [
          // Mapa
          Obx(
            () {
              if (mapaController.cargando.value) {
                return const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      ColoresVolt.primary,
                    ),
                  ),
                );
              }

              return MapaWidget(
                controller: mapaController,
                initialPosition: const LatLng(-17.783732, -63.182105),
              );
            },
          ),

          // Top app bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: ColoresVolt.backgroundSecondary,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ColoresVolt.borderColor),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.menu, color: ColoresVolt.textPrimary),
                          const SizedBox(width: 8),
                          Text(
                            'Menu',
                            style: TextStyle(
                              color: ColoresVolt.textPrimary,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: ColoresVolt.backgroundSecondary,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ColoresVolt.borderColor),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.account_circle,
                              color: ColoresVolt.textPrimary),
                          const SizedBox(width: 8),
                          Text(
                            'Perfil',
                            style: TextStyle(
                              color: ColoresVolt.textPrimary,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom card with ETA, Traffic and Actions
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: ColoresVolt.background,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Handle bar
                      Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: ColoresVolt.borderColor,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ETA Card
                      TarjetaETA(
                        lineaNumero: '5',
                        etaTexto: '8 min',
                        distancia: 2.5,
                        personas: 12,
                        onTap: () => _mostrarModalSeleccionarRuta(context),
                      ),
                      const SizedBox(height: 12),

                      // Traffic Card
                      TarjetaTrafico.bajo(
                        descripcion:
                            'La ruta presenta trafico bajo en este momento',
                      ),
                      const SizedBox(height: 16),

                      // Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: BotonRedondeado(
                              texto: 'Ver Favoritas',
                              onPressed: () =>
                                  Get.toNamed(AppRoutes.rutasFavoritas),
                              backgroundColor: ColoresVolt.backgroundSecondary,
                              textColor: ColoresVolt.primary,
                              icono: Icons.favorite,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: BotonRedondeado(
                              texto: 'Billetera',
                              onPressed: () => Get.toNamed(AppRoutes.billetera),
                              icono: Icons.wallet,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: BotonRedondeado(
                          texto: 'Ver Historial',
                          onPressed: () =>
                              Get.toNamed(AppRoutes.historial),
                          backgroundColor: ColoresVolt.backgroundSecondary,
                          textColor: ColoresVolt.primary,
                          icono: Icons.history,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _mostrarModalSeleccionarRuta(context),
        backgroundColor: ColoresVolt.primary,
        child: const Icon(Icons.add_location, color: ColoresVolt.background),
      ),
    );
  }

  void _mostrarModalSeleccionarRuta(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => ModalSeleccionarRuta(
        onSeleccionado: (linea) {
          Get.snackbar(
            'Ruta Seleccionada',
            'Linea ${linea.numero} - ${linea.nombre}',
            snackPosition: SnackPosition.BOTTOM,
          );
        },
      ),
    );
  }
}
