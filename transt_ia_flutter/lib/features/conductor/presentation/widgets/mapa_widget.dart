import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../config/tema/colores_volt.dart';
import '../../models/turno.dart';

/// Widget de mapa para mostrar ruta y ubicación actual
class MapaWidget extends StatefulWidget {
  final Turno turno;
  final Position? ubicacionActual;
  final VoidCallback? onMapCreated;

  const MapaWidget({
    Key? key,
    required this.turno,
    this.ubicacionActual,
    this.onMapCreated,
  }) : super(key: key);

  @override
  State<MapaWidget> createState() => _MapaWidgetState();
}

class _MapaWidgetState extends State<MapaWidget> {
  late GoogleMapController _mapController;
  late Set<Marker> _markers;
  late Set<Polyline> _polylines;

  @override
  void initState() {
    super.initState();
    _inicializarMapa();
  }

  void _inicializarMapa() {
    _markers = {};
    _polylines = {};
    _agregarMarkadores();
    _agregarPolyline();
  }

  void _agregarMarkadores() {
    // Marcador de ubicación actual
    if (widget.ubicacionActual != null) {
      _markers.add(
        Marker(
          markerId: const MarkerId('ubicacion-actual'),
          position: LatLng(
            widget.ubicacionActual!.latitude,
            widget.ubicacionActual!.longitude,
          ),
          infoWindow: const InfoWindow(title: 'Tu Ubicacion'),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            BitmapDescriptor.hueBlue,
          ),
        ),
      );
    }

    // Marcadores de paradas
    for (int i = 0; i < widget.turno.paradas.length; i++) {
      final parada = widget.turno.paradas[i];
      final esActual = i == widget.turno.paradasCompletadas;
      final completada = parada.completada;

      _markers.add(
        Marker(
          markerId: MarkerId('parada-${parada.id}'),
          position: LatLng(parada.latitud, parada.longitud),
          infoWindow: InfoWindow(
            title: parada.nombre,
            snippet:
                'Parada ${parada.numeroSecuencia}',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            completada
                ? BitmapDescriptor.hueGreen
                : esActual
                    ? BitmapDescriptor.hueOrange
                    : BitmapDescriptor.hueRed,
          ),
        ),
      );
    }
  }

  void _agregarPolyline() {
    if (widget.turno.paradas.length < 2) return;

    final puntos = widget.turno.paradas
        .map(
          (p) => LatLng(p.latitud, p.longitud),
        )
        .toList();

    _polylines.add(
      Polyline(
        polylineId: const PolylineId('ruta'),
        points: puntos,
        color: ColoresVolt.verde,
        width: 3,
        geodesic: true,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cameraPosition = _obtenerPosicionInicial();

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: GoogleMap(
        initialCameraPosition: cameraPosition,
        onMapCreated: (controller) {
          _mapController = controller;
          widget.onMapCreated?.call();
        },
        markers: _markers,
        polylines: _polylines,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
        zoomControlsEnabled: false,
      ),
    );
  }

  CameraPosition _obtenerPosicionInicial() {
    if (widget.ubicacionActual != null) {
      return CameraPosition(
        target: LatLng(
          widget.ubicacionActual!.latitude,
          widget.ubicacionActual!.longitude,
        ),
        zoom: 15.0,
      );
    }

    if (widget.turno.paradas.isNotEmpty) {
      final parada = widget.turno.paradas[0];
      return CameraPosition(
        target: LatLng(parada.latitud, parada.longitud),
        zoom: 15.0,
      );
    }

    return CameraPosition(
      target: const LatLng(0, 0),
      zoom: 1.0,
    );
  }
}
