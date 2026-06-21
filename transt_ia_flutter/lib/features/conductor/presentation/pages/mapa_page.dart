import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../config/tema/colores_volt.dart';
import '../../models/ruta.dart';
import '../../data/services/turnos_service.dart';

/// Página de mapa mostrando todas las rutas asignadas
class MapaPage extends StatefulWidget {
  const MapaPage({Key? key}) : super(key: key);

  @override
  State<MapaPage> createState() => _MapaPageState();
}

class _MapaPageState extends State<MapaPage> {
  final TurnosService _turnosService = TurnosService();
  late GoogleMapController _mapController;
  late Set<Marker> _markers;
  late Set<Polyline> _polylines;
  late Future<List<Ruta>> _rutasFuture;
  int _rutaSeleccionada = 0;

  @override
  void initState() {
    super.initState();
    _markers = {};
    _polylines = {};
    _rutasFuture = _turnosService.obtenerRutasHoy();
  }

  void _actualizarMarcadores(List<Ruta> rutas) {
    if (rutas.isEmpty) return;

    _markers.clear();
    _polylines.clear();

    final ruta = rutas[_rutaSeleccionada];

    // Agregar marcadores por cada punto de ruta
    for (int i = 0; i < ruta.puntos.length; i++) {
      final punto = ruta.puntos[i];
      final esInicio = punto.tipo == 'INICIO';
      final esFin = punto.tipo == 'FIN';

      _markers.add(
        Marker(
          markerId: MarkerId('punto-${punto.id}'),
          position: LatLng(punto.latitud, punto.longitud),
          infoWindow: InfoWindow(
            title: punto.nombre,
            snippet: punto.tipo,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            esInicio
                ? BitmapDescriptor.hueGreen
                : esFin
                    ? BitmapDescriptor.hueRed
                    : BitmapDescriptor.hueYellow,
          ),
        ),
      );
    }

    // Agregar polyline de ruta
    if (ruta.puntos.length >= 2) {
      final puntos = ruta.puntos
          .map((p) => LatLng(p.latitud, p.longitud))
          .toList();

      _polylines.add(
        Polyline(
          polylineId: const PolylineId('ruta'),
          points: puntos,
          color: ColoresVolt.verde,
          width: 4,
          geodesic: true,
        ),
      );
    }
  }

  void _cambiarRuta(int index) {
    setState(() {
      _rutaSeleccionada = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColoresVolt.negro,
      appBar: AppBar(
        backgroundColor: ColoresVolt.negro,
        elevation: 0,
        title: const Text(
          'Mis Rutas',
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
      body: FutureBuilder<List<Ruta>>(
        future: _rutasFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(ColoresVolt.verde),
              ),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: ColoresVolt.peligro,
                    size: 48,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error cargando rutas',
                    style: const TextStyle(
                      color: ColoresVolt.peligro,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    snapshot.error.toString(),
                    style: const TextStyle(
                      color: ColoresVolt.pizarra,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          final rutas = snapshot.data ?? [];

          if (rutas.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.map_outlined,
                    color: ColoresVolt.pizarra,
                    size: 48,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No hay rutas asignadas',
                    style: TextStyle(
                      color: ColoresVolt.blanco,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            );
          }

          _actualizarMarcadores(rutas);
          final rutaActual = rutas[_rutaSeleccionada];
          final posicionInicial = CameraPosition(
            target: LatLng(
              rutaActual.puntos[0].latitud,
              rutaActual.puntos[0].longitud,
            ),
            zoom: 14.0,
          );

          return Stack(
            children: [
              // Mapa
              GoogleMap(
                initialCameraPosition: posicionInicial,
                onMapCreated: (controller) {
                  _mapController = controller;
                },
                markers: _markers,
                polylines: _polylines,
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
                zoomControlsEnabled: false,
              ),

              // Panel de rutas inferior
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  constraints: BoxConstraints(
                    maxHeight:
                        MediaQuery.of(context).size.height * 0.3,
                  ),
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

                      // Lista de rutas
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          scrollDirection: Axis.horizontal,
                          itemCount: rutas.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: 12),
                          itemBuilder: (context, index) {
                            final ruta = rutas[index];
                            final seleccionada =
                                index == _rutaSeleccionada;

                            return Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () => _cambiarRuta(index),
                                borderRadius:
                                    BorderRadius.circular(12),
                                child: Container(
                                  width: 160,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: seleccionada
                                        ? ColoresVolt.verdeClaro15
                                        : ColoresVolt.superficie,
                                    borderRadius:
                                        BorderRadius.circular(12),
                                    border: Border.all(
                                      color: seleccionada
                                          ? ColoresVolt.verde
                                          : ColoresVolt.borde,
                                      width: seleccionada ? 2 : 1,
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        ruta.nombre,
                                        style: const TextStyle(
                                          color:
                                              ColoresVolt.blanco,
                                          fontSize: 14,
                                          fontWeight:
                                              FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow:
                                            TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        'Código: ${ruta.codigo}',
                                        style: const TextStyle(
                                          color: ColoresVolt
                                              .pizarra,
                                          fontSize: 11,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${ruta.distanciaKm.toStringAsFixed(1)} km',
                                        style: const TextStyle(
                                          color: ColoresVolt.verde,
                                          fontSize: 12,
                                          fontWeight:
                                              FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${ruta.tiempoEstimadoMinutos} min',
                                        style: const TextStyle(
                                          color: ColoresVolt
                                              .pizarra,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Botón información ruta
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: ColoresVolt.superficie,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: ColoresVolt.borde,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        rutaActual.nombre,
                        style: const TextStyle(
                          color: ColoresVolt.blanco,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${rutaActual.puntos.length} paradas',
                        style: const TextStyle(
                          color: ColoresVolt.pizarra,
                          fontSize: 11,
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
}
