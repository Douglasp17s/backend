import 'package:get/get.dart';
import '../../servicios/api_servicio.dart';
import '../../services/ubicacion_service.dart';
import '../../features/conductor/data/services/turnos_service.dart';

/// Binding para inyectar dependencias globales
class AppBinding extends Bindings {
  @override
  void dependencies() {
    // Servicios
    Get.lazyPut<ApiServicio>(() => ApiServicio(), fenix: true);
    Get.lazyPut<UbicacionService>(() => UbicacionService(), fenix: true);
    Get.lazyPut<TurnosService>(() => TurnosService(), fenix: true);
  }
}
