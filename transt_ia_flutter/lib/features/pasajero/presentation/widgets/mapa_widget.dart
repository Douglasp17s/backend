import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:get/get.dart';
import '../controllers/mapa_controller.dart';

class MapaWidget extends StatelessWidget {
  final MapaController controller;
  final LatLng initialPosition;

  const MapaWidget({
    super.key,
    required this.controller,
    required this.initialPosition,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => GoogleMap(
        onMapCreated: controller.onMapCreated,
        initialCameraPosition: CameraPosition(
          target: controller.ubicacionActual.value != null
              ? LatLng(
                  controller.ubicacionActual.value!.latitud,
                  controller.ubicacionActual.value!.longitud,
                )
              : initialPosition,
          zoom: 15,
        ),
        markers: controller.marcadores.toSet(),
        polylines: controller.polilineas.toSet(),
        myLocationEnabled: true,
        myLocationButtonEnabled: false,
        compassEnabled: true,
        mapToolbarEnabled: false,
        zoomControlsEnabled: false,
        liteModeEnabled: false,
      ),
    );
  }
}
