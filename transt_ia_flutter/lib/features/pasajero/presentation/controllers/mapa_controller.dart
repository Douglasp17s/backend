import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/ubicacion_modelo.dart';
import '../../data/services/mapas_service.dart';
import '../../../../services/ubicacion_service.dart';

class MapaController extends GetxController {
  final ubicacionService = UbicacionService();

  // Observables
  final ubicacionActual = Rxn<UbicacionModelo>();
  final marcadores = RxSet<Marker>();
  final polilineas = RxSet<Polyline>();
  final cargando = false.obs;
  final error = Rxn<String>();

  late GoogleMapController mapaController;

  @override
  void onInit() {
    super.onInit();
    inicializarMapa();
  }

  void onMapCreated(GoogleMapController controller) {
    mapaController = controller;
    MapasService.setController(controller);
  }

  Future<void> inicializarMapa() async {
    try {
      cargando.value = true;
      error.value = null;

      final posicion = await ubicacionService.obtenerUbicacionActual();

      ubicacionActual.value = UbicacionModelo(
        latitud: posicion.latitude,
        longitud: posicion.longitude,
        precision: posicion.accuracy,
      );

      await MapasService.moverCamara(
        latitud: posicion.latitude,
        longitud: posicion.longitude,
        zoom: 15,
      );

      _agregarMarcadorUbicacionActual();
      _iniciarActualizacionUbicacion();

      cargando.value = false;
    } catch (e) {
      error.value = 'Error al obtener ubicacion: ${e.toString()}';
      cargando.value = false;
    }
  }

  void _agregarMarcadorUbicacionActual() {
    if (ubicacionActual.value == null) return;

    final marcador = MapasService.crearMarcador(
      markerId: 'ubicacion_actual',
      latitud: ubicacionActual.value!.latitud,
      longitud: ubicacionActual.value!.longitud,
      titulo: 'Tu ubicacion',
      snippet: 'Posicion actual',
    );

    marcadores.add(marcador);
  }

  void _iniciarActualizacionUbicacion() {
    ubicacionService.obtenerFluyoUbicacion().listen((posicion) {
      ubicacionActual.value = UbicacionModelo(
        latitud: posicion.latitude,
        longitud: posicion.longitude,
        precision: posicion.accuracy,
      );

      _actualizarMarcadorUbicacionActual();
    });
  }

  void _actualizarMarcadorUbicacionActual() {
    marcadores.removeWhere((m) => m.markerId.value == 'ubicacion_actual');
    _agregarMarcadorUbicacionActual();
  }

  void agregarMarcador({
    required String id,
    required double latitud,
    required double longitud,
    String? titulo,
    String? snippet,
  }) {
    final marcador = MapasService.crearMarcador(
      markerId: id,
      latitud: latitud,
      longitud: longitud,
      titulo: titulo,
      snippet: snippet,
    );

    marcadores.add(marcador);
  }

  void agregarPolilinea({
    required String id,
    required List<LatLng> puntos,
  }) {
    final polilinea = MapasService.crearPolyline(
      polylineId: id,
      puntos: puntos,
    );

    polilineas.add(polilinea);
  }

  void limpiarMarcadores() {
    marcadores.clear();
  }

  void limpiarPolilineas() {
    polilineas.clear();
  }

  @override
  void onClose() {
    mapaController.dispose();
    super.onClose();
  }
}
