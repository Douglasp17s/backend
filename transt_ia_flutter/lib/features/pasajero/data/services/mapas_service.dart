import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapasService {
  static late GoogleMapController _controller;

  static GoogleMapController get controller => _controller;

  static void setController(GoogleMapController controller) {
    _controller = controller;
  }

  static Future<void> moverCamara({
    required double latitud,
    required double longitud,
    double zoom = 15,
    bool animado = true,
  }) async {
    final nuevaPosicion = CameraPosition(
      target: LatLng(latitud, longitud),
      zoom: zoom,
    );

    if (animado) {
      await _controller.animateCamera(
        CameraUpdate.newCameraPosition(nuevaPosicion),
      );
    } else {
      await _controller.moveCamera(
        CameraUpdate.newCameraPosition(nuevaPosicion),
      );
    }
  }

  static Future<void> moverCameraABounds({
    required LatLng noroeste,
    required LatLng sureste,
    int padding = 100,
  }) async {
    final bounds = LatLngBounds(
      southwest: LatLng(
        sureste.latitude,
        noroeste.longitude,
      ),
      northeast: LatLng(
        noroeste.latitude,
        sureste.longitude,
      ),
    );

    await _controller.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, padding.toDouble()),
    );
  }

  static Marker crearMarcador({
    required String markerId,
    required double latitud,
    required double longitud,
    String? titulo,
    String? snippet,
    BitmapDescriptor? icono,
  }) {
    return Marker(
      markerId: MarkerId(markerId),
      position: LatLng(latitud, longitud),
      infoWindow: InfoWindow(
        title: titulo,
        snippet: snippet,
      ),
      icon: icono ?? BitmapDescriptor.defaultMarker,
    );
  }

  static Polyline crearPolyline({
    required String polylineId,
    required List<LatLng> puntos,
    Color color = const Color(0xFF00d992),
    int ancho = 5,
  }) {
    return Polyline(
      polylineId: PolylineId(polylineId),
      points: puntos,
      color: color,
      width: ancho,
      geodesic: true,
    );
  }

  static Circle crearCirculo({
    required String circleId,
    required double latitud,
    required double longitud,
    double radio = 100,
    Color color = const Color(0x5300d992),
    Color strokedColor = const Color(0xFF00d992),
  }) {
    return Circle(
      circleId: CircleId(circleId),
      center: LatLng(latitud, longitud),
      radius: radio,
      fillColor: color,
      strokeColor: strokedColor,
      strokeWidth: 2,
    );
  }

  static double calcularZoom({required double ancho}) {
    return 16 - ancho / 500;
  }
}
