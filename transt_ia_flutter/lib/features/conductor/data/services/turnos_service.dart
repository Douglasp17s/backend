import 'package:get/get.dart';
import '../../models/turno.dart';
import '../../models/ruta.dart';
import '../../../../servicios/api_servicio.dart';

/// Servicio para operaciones relacionadas con turnos
class TurnosService {
  final ApiServicio _apiServicio = Get.find<ApiServicio>();

  /// Obtener turno activo del conductor
  Future<Turno?> obtenerTurnoActivo() async {
    try {
      final response = await _apiServicio.obtener('/conductor/turno-activo');
      if (response['ok'] == true && response['data'] != null) {
        return Turno.fromJson(response['data'] as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  /// Obtener turnos del día actual
  Future<List<Turno>> obtenerTurnosDia() async {
    try {
      final response = await _apiServicio.obtener('/conductor/turnos-dia');
      if (response['ok'] == true && response['data'] is List) {
        return (response['data'] as List)
            .map((t) => Turno.fromJson(t as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  /// Iniciar un nuevo turno
  Future<Turno> iniciarTurno({
    required String rutaId,
    double? latitud,
    double? longitud,
  }) async {
    try {
      final datos = {
        'rutaId': rutaId,
        if (latitud != null) 'latitud': latitud,
        if (longitud != null) 'longitud': longitud,
      };
      final response = await _apiServicio.post(
        '/conductor/iniciar-turno',
        datos: datos,
      );
      if (response['ok'] == true && response['data'] != null) {
        return Turno.fromJson(response['data'] as Map<String, dynamic>);
      }
      throw Exception('No se pudo iniciar el turno');
    } catch (e) {
      rethrow;
    }
  }

  /// Finalizar turno activo
  Future<Turno> finalizarTurno({
    required String turnoId,
    double? latitud,
    double? longitud,
  }) async {
    try {
      final datos = {
        if (latitud != null) 'latitud': latitud,
        if (longitud != null) 'longitud': longitud,
      };
      final response = await _apiServicio.post(
        '/conductor/turnos/$turnoId/finalizar',
        datos: datos,
      );
      if (response['ok'] == true && response['data'] != null) {
        return Turno.fromJson(response['data'] as Map<String, dynamic>);
      }
      throw Exception('No se pudo finalizar el turno');
    } catch (e) {
      rethrow;
    }
  }

  /// Registrar llegada a parada
  Future<Turno> registrarParada({
    required String turnoId,
    required String paradaId,
    required double latitud,
    required double longitud,
  }) async {
    try {
      final datos = {
        'paradaId': paradaId,
        'latitud': latitud,
        'longitud': longitud,
      };
      final response = await _apiServicio.post(
        '/conductor/turnos/$turnoId/parada',
        datos: datos,
      );
      if (response['ok'] == true && response['data'] != null) {
        return Turno.fromJson(response['data'] as Map<String, dynamic>);
      }
      throw Exception('No se pudo registrar la parada');
    } catch (e) {
      rethrow;
    }
  }

  /// Actualizar ubicación en tiempo real
  Future<void> actualizarUbicacion({
    required String turnoId,
    required double latitud,
    required double longitud,
  }) async {
    try {
      final datos = {
        'latitud': latitud,
        'longitud': longitud,
      };
      await _apiServicio.patch(
        '/conductor/turnos/$turnoId/ubicacion',
        datos: datos,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Obtener rutas asignadas para hoy
  Future<List<Ruta>> obtenerRutasHoy() async {
    try {
      final response = await _apiServicio.obtener('/conductor/rutas-hoy');
      if (response['ok'] == true && response['data'] is List) {
        return (response['data'] as List)
            .map((r) => Ruta.fromJson(r as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  /// Obtener ganancias del día
  Future<GananciasDia> obtenerGananciasDia() async {
    try {
      final response = await _apiServicio.obtener('/conductor/ganancias-hoy');
      if (response['ok'] == true && response['data'] != null) {
        return GananciasDia.fromJson(response['data'] as Map<String, dynamic>);
      }
      throw Exception('No se pudieron obtener las ganancias');
    } catch (e) {
      rethrow;
    }
  }

  /// Obtener ganancias históricas
  Future<List<GananciasDia>> obtenerGananciasHistorico({
    required int dias,
  }) async {
    try {
      final response = await _apiServicio
          .obtener('/conductor/ganancias-historico?dias=$dias');
      if (response['ok'] == true && response['data'] is List) {
        return (response['data'] as List)
            .map((g) => GananciasDia.fromJson(g as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
