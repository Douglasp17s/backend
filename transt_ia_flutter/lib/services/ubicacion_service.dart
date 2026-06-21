import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:workmanager/workmanager.dart';
import 'package:logger/logger.dart';
import '../servicios/api_servicio.dart';

/// Servicio de ubicación para actualizaciones en tiempo real
class UbicacionService {
  static const String actualizarUbicacionTarea =
      'actualizar_ubicacion_background';
  static const String actualizarUbicacionTareaPeriodicaId =
      'ubicacion_periodica_1';

  static final UbicacionService _instancia =
      UbicacionService._interno();
  final _logger = Logger();

  factory UbicacionService() {
    return _instancia;
  }

  UbicacionService._interno();

  /// Inicializar servicio de ubicación
  Future<void> inicializar() async {
    try {
      // Solicitar permisos
      final permisoUbicacion = await Geolocator.checkPermission();
      if (permisoUbicacion == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }

      // Configurar workmanager
      await Workmanager().initialize(
        callbackDispatcher,
        isInDebugMode: false,
      );

      _logger.i('Servicio de ubicación inicializado');
    } catch (e) {
      _logger.e('Error inicializando ubicación: $e');
    }
  }

  /// Iniciar actualizaciones periódicas de ubicación
  Future<void> iniciarActualizacionesPeriodicas({
    Duration intervalo = const Duration(minutes: 15),
    required String turnoId,
  }) async {
    try {
      await Workmanager().registerPeriodicTask(
        actualizarUbicacionTareaPeriodicaId,
        actualizarUbicacionTarea,
        frequency: intervalo,
        constraints: Constraints(
          requiresBatteryNotLow: false,
          requiresCharging: false,
          requiresDeviceIdle: false,
          networkType: NetworkType.connected,
        ),
        inputData: {'turnoId': turnoId},
      );

      _logger.i('Actualizaciones periódicas iniciadas para turno: $turnoId');
    } catch (e) {
      _logger.e('Error iniciando actualizaciones periódicas: $e');
    }
  }

  /// Detener actualizaciones periódicas
  Future<void> detenerActualizacionesPeriodicas() async {
    try {
      await Workmanager().cancelByTag(actualizarUbicacionTareaPeriodicaId);
      _logger.i('Actualizaciones periódicas detenidas');
    } catch (e) {
      _logger.e('Error deteniendo actualizaciones periódicas: $e');
    }
  }

  /// Obtener ubicación actual
  Future<Position> obtenerUbicacionActual() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (e) {
      _logger.e('Error obteniendo ubicación: $e');
      rethrow;
    }
  }

  /// Stream de ubicación en tiempo real
  Stream<Position> obtenerFluyoUbicacion({
    LocationAccuracy accuracy = LocationAccuracy.high,
    int distanceFilter = 10,
  }) {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: accuracy,
        distanceFilter: distanceFilter,
      ),
    );
  }

  /// Calcular distancia entre dos puntos
  double calcularDistancia(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }
}

/// Callback para workmanager
void callbackDispatcher() {
  Workmanager().executeTask(
    (taskName, inputData) async {
      try {
        if (taskName == UbicacionService.actualizarUbicacionTarea) {
          final turnoId = inputData?['turnoId'] as String?;
          if (turnoId == null) return false;

          // Obtener ubicación actual
          final posicion = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.best,
            timeLimit: const Duration(seconds: 10),
          );

          // Enviar al servidor
          final apiServicio = Get.find<ApiServicio>();
          await apiServicio.patch(
            '/conductor/turnos/$turnoId/ubicacion',
            datos: {
              'latitud': posicion.latitude,
              'longitud': posicion.longitude,
            },
          );

          return true;
        }
        return false;
      } catch (e) {
        Logger().e('Error en callbackDispatcher: $e');
        return false;
      }
    },
  );
}
