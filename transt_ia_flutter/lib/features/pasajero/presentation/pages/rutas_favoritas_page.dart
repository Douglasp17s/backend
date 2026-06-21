import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores.dart';
import '../controllers/rutas_controller.dart';
import '../widgets/boton_redondeado.dart';

class RutasFavoritasPage extends StatefulWidget {
  const RutasFavoritasPage({super.key});

  @override
  State<RutasFavoritasPage> createState() => _RutasFavoritasPageState();
}

class _RutasFavoritasPageState extends State<RutasFavoritasPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late RutasController rutasController;

  @override
  void initState() {
    super.initState();
    rutasController = Get.find<RutasController>();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColoresVolt.background,
      appBar: AppBar(
        title: const Text('Mis Rutas'),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Favoritas'),
            Tab(text: 'Todas'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Favoritas Tab
          Obx(
            () {
              final favoritas = rutasController.lineas
                  .where((linea) => rutasController.esFavorita(linea.id))
                  .toList();

              if (favoritas.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.favorite_border,
                        size: 64,
                        color: ColoresVolt.textSecondary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No tienes rutas favoritas',
                        style: TextStyle(
                          fontSize: 16,
                          color: ColoresVolt.textSecondary,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: 200,
                        child: BotonRedondeado(
                          texto: 'Agregar Favorita',
                          onPressed: () => _tabController.animateTo(1),
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: favoritas.length,
                itemBuilder: (context, index) {
                  final linea = favoritas[index];

                  return GestureDetector(
                    onHorizontalDragEnd: (details) {
                      if (details.primaryVelocity! < 0) {
                        rutasController.eliminarFavorita(linea.id);
                      }
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
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
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Linea ${linea.numero}',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: ColoresVolt.textPrimary,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    linea.nombre,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: ColoresVolt.textSecondary,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'Bs. ${linea.precio.toStringAsFixed(2)}',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: ColoresVolt.primary,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${linea.duracionEstimada.toStringAsFixed(0)} min',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: ColoresVolt.textTertiary,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '${linea.origen} → ${linea.destino}',
                            style: TextStyle(
                              fontSize: 13,
                              color: ColoresVolt.textSecondary,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: BotonRedondeado(
                                  texto: 'Seleccionar',
                                  onPressed: () {},
                                  alto: 44,
                                ),
                              ),
                              const SizedBox(width: 12),
                              GestureDetector(
                                onTap: () =>
                                    rutasController.eliminarFavorita(linea.id),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: ColoresVolt.background,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: ColoresVolt.error,
                                    ),
                                  ),
                                  child: Icon(
                                    Icons.favorite,
                                    color: ColoresVolt.error,
                                  ),
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

          // Todas Tab
          Obx(
            () {
              if (rutasController.cargando.value) {
                return const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      ColoresVolt.primary,
                    ),
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: rutasController.lineas.length,
                itemBuilder: (context, index) {
                  final linea = rutasController.lineas[index];
                  final esFavorita = rutasController.esFavorita(linea.id);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
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
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Linea ${linea.numero}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: ColoresVolt.textPrimary,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  linea.nombre,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: ColoresVolt.textSecondary,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Bs. ${linea.precio.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: ColoresVolt.primary,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${linea.duracionEstimada.toStringAsFixed(0)} min',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: ColoresVolt.textTertiary,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '${linea.origen} → ${linea.destino}',
                          style: TextStyle(
                            fontSize: 13,
                            color: ColoresVolt.textSecondary,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: BotonRedondeado(
                                texto: 'Seleccionar',
                                onPressed: () {},
                                alto: 44,
                              ),
                            ),
                            const SizedBox(width: 12),
                            GestureDetector(
                              onTap: () {
                                if (esFavorita) {
                                  rutasController.eliminarFavorita(linea.id);
                                } else {
                                  rutasController.agregarFavorita(linea.id);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ColoresVolt.background,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: esFavorita
                                        ? ColoresVolt.error
                                        : ColoresVolt.borderColor,
                                  ),
                                ),
                                child: Icon(
                                  esFavorita
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                  color: esFavorita
                                      ? ColoresVolt.error
                                      : ColoresVolt.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
