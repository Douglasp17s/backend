import 'package:get/get.dart';
import '../../models/turno.dart';
import '../../models/ruta.dart';
import '../../data/services/turnos_service.dart';

/// Controlador del panel principal del conductor
class PanelController extends GetxController {
  final TurnosService _turnosService = TurnosService();

  final turnoActivo = Rx<Turno?>(null);
  final rutasDisponibles = <Ruta>[].obs;
  final gananciaHoy = 0.0.obs;
  final isLoading = false.obs;
  final errorMensaje = ''.obs;

  @override
  void onInit() {
    super.onInit();
    cargarDatos();
    // Recargar cada 30 segundos
    ever(turnoActivo, (_) => cargarDatos());
  }

  /// Cargar datos iniciales del panel
  Future<void> cargarDatos() async {
    try {
      isLoading.value = true;
      errorMensaje.value = '';

      // Obtener turno activo
      final turno = await _turnosService.obtenerTurnoActivo();
      turnoActivo.value = turno;

      // Obtener rutas disponibles
      final rutas = await _turnosService.obtenerRutasHoy();
      rutasDisponibles.value = rutas;

      // Obtener ganancias del día
      try {
        final ganancias = await _turnosService.obtenerGananciasDia();
        gananciaHoy.value = ganancias.total;
      } catch (_) {
        gananciaHoy.value = turno?.gananciaTotal ?? 0.0;
      }
    } catch (e) {
      errorMensaje.value = 'Error al cargar datos: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  /// Iniciar un nuevo turno
  Future<bool> iniciarTurno({
    required String rutaId,
    double? latitud,
    double? longitud,
  }) async {
    try {
      isLoading.value = true;
      errorMensaje.value = '';

      final turno = await _turnosService.iniciarTurno(
        rutaId: rutaId,
        latitud: latitud,
        longitud: longitud,
      );

      turnoActivo.value = turno;
      gananciaHoy.value = turno.gananciaTotal;
      return true;
    } catch (e) {
      errorMensaje.value = 'No se pudo iniciar turno: ${e.toString()}';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Obtener estado del turno como texto
  String obtenerEstadoTexto() {
    if (turnoActivo.value == null) {
      return 'Sin Turno';
    }
    final estado = turnoActivo.value!.estado;
    switch (estado) {
      case 'INICIADO':
        return 'En Turno';
      case 'EN_RUTA':
        return 'En Ruta';
      case 'COMPLETADO':
        return 'Completado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  /// Limpiar error
  void limpiarError() {
    errorMensaje.value = '';
  }
}
