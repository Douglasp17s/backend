import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import '../../models/turno.dart';
import '../../data/services/turnos_service.dart';

/// Controlador del turno activo con actualización de ubicación
class TurnoController extends GetxController {
  final TurnosService _turnosService = TurnosService();

  final turnoActivo = Rx<Turno?>(null);
  final paradaActual = Rx<Parada?>(null);
  final proximaParada = Rx<Parada?>(null);
  final ubicacionActual = Rx<Position?>(null);
  final gananciaAcumulada = 0.0.obs;
  final tiempoTranscurrido = '00:00:00'.obs;
  final progreso = 0.0.obs;
  final isLoading = false.obs;
  final errorMensaje = ''.obs;

  late Timer _timerActualizacion;
  late Timer _timerTiempo;

  @override
  void onInit() {
    super.onInit();
    _inicializarTurno();
  }

  @override
  void onClose() {
    _timerActualizacion.cancel();
    _timerTiempo.cancel();
    super.onClose();
  }

  /// Inicializar datos del turno
  Future<void> _inicializarTurno() async {
    try {
      isLoading.value = true;
      errorMensaje.value = '';

      final turno = await _turnosService.obtenerTurnoActivo();
      if (turno != null) {
        turnoActivo.value = turno;
        gananciaAcumulada.value = turno.gananciaTotal;
        progreso.value = turno.obtenerProgreso();

        // Obtener parada actual y próxima
        _actualizarParadas();

        // Iniciar actualización de ubicación cada 5 segundos
        _iniciarActualizacionUbicacion();

        // Iniciar temporizador de tiempo transcurrido
        _iniciarTiempoTranscurrido();
      }
    } catch (e) {
      errorMensaje.value = 'Error al cargar turno: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  /// Actualizar paradas actual y próxima
  void _actualizarParadas() {
    if (turnoActivo.value == null) return;

    final paradas = turnoActivo.value!.paradas;
    final completadas = turnoActivo.value!.paradasCompletadas;

    if (completadas < paradas.length) {
      paradaActual.value = paradas[completadas];
    }

    if (completadas + 1 < paradas.length) {
      proximaParada.value = paradas[completadas + 1];
    }
  }

  /// Iniciar actualización de ubicación en tiempo real
  void _iniciarActualizacionUbicacion() {
    _timerActualizacion = Timer.periodic(
      const Duration(seconds: 5),
      (_) async {
        try {
          final position = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
            timeLimit: const Duration(seconds: 5),
          );
          ubicacionActual.value = position;

          if (turnoActivo.value != null) {
            await _turnosService.actualizarUbicacion(
              turnoId: turnoActivo.value!.id,
              latitud: position.latitude,
              longitud: position.longitude,
            );
          }
        } catch (e) {
          // No mostrar error de ubicación constantemente
          // ignore: avoid_print
          print('Error actualizando ubicación: $e');
        }
      },
    );
  }

  /// Iniciar temporizador de tiempo transcurrido
  void _iniciarTiempoTranscurrido() {
    _timerTiempo = Timer.periodic(
      const Duration(seconds: 1),
      (_) {
        if (turnoActivo.value != null) {
          final duracion = turnoActivo.value!.obtenerDuracion();
          final horas = duracion.inHours.toString().padLeft(2, '0');
          final minutos =
              (duracion.inMinutes % 60).toString().padLeft(2, '0');
          final segundos = (duracion.inSeconds % 60).toString().padLeft(2, '0');
          tiempoTranscurrido.value = '$horas:$minutos:$segundos';
        }
      },
    );
  }

  /// Registrar llegada a siguiente parada
  Future<bool> registrarProximaParada() async {
    try {
      if (turnoActivo.value == null || paradaActual.value == null) {
        errorMensaje.value = 'No hay información de parada disponible';
        return false;
      }

      isLoading.value = true;
      errorMensaje.value = '';

      final posicion = ubicacionActual.value;
      final latitud =
          posicion?.latitude ?? turnoActivo.value!.latitudActual;
      final longitud =
          posicion?.longitude ?? turnoActivo.value!.longitudActual;

      final turnoActualizado = await _turnosService.registrarParada(
        turnoId: turnoActivo.value!.id,
        paradaId: paradaActual.value!.id,
        latitud: latitud,
        longitud: longitud,
      );

      turnoActivo.value = turnoActualizado;
      gananciaAcumulada.value = turnoActualizado.gananciaTotal;
      progreso.value = turnoActualizado.obtenerProgreso();
      _actualizarParadas();

      return true;
    } catch (e) {
      errorMensaje.value = 'Error registrando parada: ${e.toString()}';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Finalizar turno
  Future<bool> finalizarTurno() async {
    try {
      if (turnoActivo.value == null) {
        errorMensaje.value = 'No hay turno activo';
        return false;
      }

      isLoading.value = true;
      errorMensaje.value = '';

      final posicion = ubicacionActual.value;
      final latitud =
          posicion?.latitude ?? turnoActivo.value!.latitudActual;
      final longitud =
          posicion?.longitude ?? turnoActivo.value!.longitudActual;

      await _turnosService.finalizarTurno(
        turnoId: turnoActivo.value!.id,
        latitud: latitud,
        longitud: longitud,
      );

      // Detener timers
      _timerActualizacion.cancel();
      _timerTiempo.cancel();

      turnoActivo.value = null;
      return true;
    } catch (e) {
      errorMensaje.value = 'Error finalizando turno: ${e.toString()}';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Obtener color de estado
  String obtenerColorEstado() {
    if (turnoActivo.value == null) return '#0f0f0f';
    switch (turnoActivo.value!.estado) {
      case 'INICIADO':
        return '#4cb3d4'; // info
      case 'EN_RUTA':
        return '#00d992'; // verde
      case 'COMPLETADO':
        return '#008b00'; // exito
      default:
        return '#fb565b'; // peligro
    }
  }

  /// Limpiar error
  void limpiarError() {
    errorMensaje.value = '';
  }
}
