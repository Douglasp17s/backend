import 'package:get/get.dart';
import '../../models/turno.dart';
import '../../data/services/turnos_service.dart';

/// Controlador para visualización de ganancias
class GananciasController extends GetxController {
  final TurnosService _turnosService = TurnosService();

  final gananciaHoy = GananciasDia(
    total: 0.0,
    porRuta: {},
    porHora: {},
    fecha: DateTime.now(),
  ).obs;

  final gananciasHistorico = <GananciasDia>[].obs;
  final isLoading = false.obs;
  final errorMensaje = ''.obs;
  final diasMostrados = 7.obs;

  @override
  void onInit() {
    super.onInit();
    cargarGanancias();
  }

  /// Cargar ganancias del día y históricas
  Future<void> cargarGanancias() async {
    try {
      isLoading.value = true;
      errorMensaje.value = '';

      // Obtener ganancias de hoy
      try {
        final hoy = await _turnosService.obtenerGananciasDia();
        gananciaHoy.value = hoy;
      } catch (e) {
        // Si no hay ganancias hoy, usar valor por defecto
        gananciaHoy.value = GananciasDia(
          total: 0.0,
          porRuta: {},
          porHora: {},
          fecha: DateTime.now(),
        );
      }

      // Obtener históricas
      final historicas =
          await _turnosService.obtenerGananciasHistorico(dias: diasMostrados.value);
      gananciasHistorico.value = historicas;
    } catch (e) {
      errorMensaje.value = 'Error cargando ganancias: ${e.toString()}';
    } finally {
      isLoading.value = false;
    }
  }

  /// Cambiar período de visualización
  Future<void> cambiarPeriodo(int dias) async {
    diasMostrados.value = dias;
    await cargarGanancias();
  }

  /// Obtener ganancias promedio de los últimos días
  double obtenerPromedioGanancias() {
    if (gananciasHistorico.isEmpty) return 0.0;
    final total = gananciasHistorico.fold<double>(
      0.0,
      (sum, g) => sum + g.total,
    );
    return total / gananciasHistorico.length;
  }

  /// Obtener ganancias máximas
  double obtenerGananciaMaxima() {
    if (gananciasHistorico.isEmpty) return 0.0;
    return gananciasHistorico.fold<double>(
      0.0,
      (max, g) => g.total > max ? g.total : max,
    );
  }

  /// Obtener ganancias mínimas
  double obtenerGananciaMinima() {
    if (gananciasHistorico.isEmpty) return 0.0;
    return gananciasHistorico.fold<double>(
      double.infinity,
      (min, g) => g.total < min ? g.total : min,
    ) == double.infinity
        ? 0.0
        : gananciasHistorico.fold<double>(
            double.infinity,
            (min, g) => g.total < min ? g.total : min,
          );
  }

  /// Comparar con día anterior
  double obtenerCambioConAyerPorcentaje() {
    if (gananciasHistorico.length < 2) return 0.0;
    final hoy = gananciasHistorico.last.total;
    final ayer = gananciasHistorico[gananciasHistorico.length - 2].total;
    if (ayer == 0) return 0.0;
    return ((hoy - ayer) / ayer) * 100;
  }

  /// Obtener ruta con mayores ganancias
  String obtenerRutaTopGanancias() {
    if (gananciaHoy.value.porRuta.isEmpty) return 'N/A';
    final entrada = gananciaHoy.value.porRuta.entries.reduce(
      (a, b) => a.value > b.value ? a : b,
    );
    return '${entrada.key}: Bs ${entrada.value.toStringAsFixed(2)}';
  }

  /// Obtener hora con mayores ganancias
  String obtenerHoraTopGanancias() {
    if (gananciaHoy.value.porHora.isEmpty) return 'N/A';
    final entrada = gananciaHoy.value.porHora.entries.reduce(
      (a, b) => a.value > b.value ? a : b,
    );
    final hora = entrada.key.toString().padLeft(2, '0');
    return '${hora}:00 - Bs ${entrada.value.toStringAsFixed(2)}';
  }

  /// Limpiar error
  void limpiarError() {
    errorMensaje.value = '';
  }
}
