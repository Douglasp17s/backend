import 'package:get/get.dart';
import '../../../../models/billetera.dart';
import '../../../../services/api_service.dart';

class BilleteraController extends GetxController {
  final billetera = Rxn<Billetera>();
  final transacciones = <TransaccionBilletera>[].obs;
  final cargando = false.obs;
  final error = Rxn<String>();
  final procesandoPago = false.obs;

  @override
  void onInit() {
    super.onInit();
    cargarBilletera();
    cargarTransacciones();
  }

  Future<void> cargarBilletera() async {
    try {
      cargando.value = true;
      error.value = null;

      billetera.value = await ApiService.obtener<Billetera>(
        '/billetera',
        fromJson: (data) => Billetera.fromJson(data as Map<String, dynamic>),
      );
    } catch (e) {
      error.value = 'Error al cargar billetera: ${e.toString()}';
    } finally {
      cargando.value = false;
    }
  }

  Future<void> cargarTransacciones() async {
    try {
      transacciones.value = await ApiService.obtenerLista<List<TransaccionBilletera>>(
        '/billetera/transacciones',
        fromJsonList: (data) {
          return (data as List)
              .map((item) => TransaccionBilletera.fromJson(item as Map<String, dynamic>))
              .toList();
        },
      );
    } catch (e) {
      error.value = 'Error al cargar transacciones: ${e.toString()}';
    }
  }

  Future<void> recargar(double monto) async {
    try {
      procesandoPago.value = true;
      error.value = null;

      final resultado = await ApiService.crear(
        '/billetera/recargar',
        {'monto': monto},
        fromJson: (data) => data,
      );

      if (resultado['ok'] == true) {
        await cargarBilletera();
        await cargarTransacciones();
        Get.snackbar(
          'Exito',
          'Recarga realizada correctamente',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      error.value = 'Error en la recarga: ${e.toString()}';
      Get.snackbar(
        'Error',
        error.value ?? 'Error desconocido',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      procesandoPago.value = false;
    }
  }

  Future<void> pagar({
    required String lineaId,
    required double monto,
  }) async {
    try {
      procesandoPago.value = true;
      error.value = null;

      if (billetera.value == null || billetera.value!.saldo < monto) {
        error.value = 'Saldo insuficiente';
        throw Exception('Saldo insuficiente');
      }

      final resultado = await ApiService.crear(
        '/billetera/pagar',
        {
          'lineaId': lineaId,
          'monto': monto,
        },
        fromJson: (data) => data,
      );

      if (resultado['ok'] == true) {
        await cargarBilletera();
        await cargarTransacciones();
        Get.snackbar(
          'Exito',
          'Pago realizado correctamente',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      error.value = 'Error al pagar: ${e.toString()}';
      Get.snackbar(
        'Error',
        error.value ?? 'Error desconocido',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      procesandoPago.value = false;
    }
  }

  String obtenerSaldoFormateado() {
    if (billetera.value == null) return 'Bs. 0.00';
    return 'Bs. ${billetera.value!.saldoBs.toStringAsFixed(2)}';
  }

  List<TransaccionBilletera> obtenerTransaccionesIngresos() {
    return transacciones
        .where((t) => t.tipo == 'INGRESO' || t.tipo == 'RECARGA')
        .toList();
  }

  List<TransaccionBilletera> obtenerTransaccionesGastos() {
    return transacciones.where((t) => t.tipo == 'PAGO' || t.tipo == 'GASTO').toList();
  }
}
