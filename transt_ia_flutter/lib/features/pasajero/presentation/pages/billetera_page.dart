import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores.dart';
import '../controllers/billetera_controller.dart';
import '../widgets/boton_redondeado.dart';

class BilleteraPage extends StatefulWidget {
  const BilleteraPage({super.key});

  @override
  State<BilleteraPage> createState() => _BilleteraPageState();
}

class _BilleteraPageState extends State<BilleteraPage> {
  late BilleteraController controller;
  final _montoCotroller = TextEditingController();

  @override
  void initState() {
    super.initState();
    controller = Get.put(BilleteraController());
  }

  @override
  void dispose() {
    _montoCotroller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColoresVolt.background,
      appBar: AppBar(
        title: const Text('Mi Billetera'),
        elevation: 0,
      ),
      body: Obx(
        () {
          if (controller.cargando.value) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  ColoresVolt.primary,
                ),
              ),
            );
          }

          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Saldo Display
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: ColoresVolt.primaryGradient,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Saldo Disponible',
                          style: TextStyle(
                            fontSize: 14,
                            color: ColoresVolt.background.withValues(alpha: 0.8),
                            fontFamily: 'Poppins',
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          controller.obtenerSaldoFormateado(),
                          style: TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: ColoresVolt.background,
                            fontFamily: 'Poppins',
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: ColoresVolt.background.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'Descuento Activo: 10%',
                            style: TextStyle(
                              fontSize: 12,
                              color: ColoresVolt.background,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Recargar section
                  Text(
                    'Recargar Billetera',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColoresVolt.textPrimary,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _montoCotroller,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    decoration: InputDecoration(
                      hintText: 'Ingresa el monto',
                      prefixText: 'Bs. ',
                      filled: true,
                      fillColor: ColoresVolt.backgroundSecondary,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide:
                            const BorderSide(color: ColoresVolt.borderColor),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide:
                            const BorderSide(color: ColoresVolt.borderColor),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: ColoresVolt.primary,
                          width: 2,
                        ),
                      ),
                    ),
                    style: TextStyle(
                      color: ColoresVolt.textPrimary,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: BotonRedondeado(
                      texto: 'Recargar',
                      cargando: controller.procesandoPago.value,
                      onPressed: () {
                        final monto = double.tryParse(_montoCotroller.text);
                        if (monto == null || monto <= 0) {
                          Get.snackbar(
                            'Error',
                            'Ingresa un monto valido',
                            snackPosition: SnackPosition.BOTTOM,
                          );
                          return;
                        }
                        controller.recargar(monto);
                        _montoCotroller.clear();
                      },
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Transacciones
                  Text(
                    'Movimientos',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: ColoresVolt.textPrimary,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Obx(
                    () {
                      if (controller.transacciones.isEmpty) {
                        return Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 32),
                            child: Text(
                              'Sin movimientos',
                              style: TextStyle(
                                color: ColoresVolt.textSecondary,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ),
                        );
                      }

                      return ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: controller.transacciones.length,
                        itemBuilder: (context, index) {
                          final transaccion = controller.transacciones[index];
                          final esIngreso = transaccion.tipo == 'INGRESO' ||
                              transaccion.tipo == 'RECARGA';
                          final color = esIngreso
                              ? ColoresVolt.success
                              : ColoresVolt.error;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: ColoresVolt.backgroundSecondary,
                              borderRadius: BorderRadius.circular(12),
                              border:
                                  Border.all(color: ColoresVolt.borderColor),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: color.withValues(alpha: 0.2),
                                        borderRadius:
                                            BorderRadius.circular(8),
                                      ),
                                      child: Icon(
                                        esIngreso
                                            ? Icons.arrow_upward
                                            : Icons.arrow_downward,
                                        color: color,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          transaccion.tipo,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: ColoresVolt.textPrimary,
                                            fontFamily: 'Poppins',
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          transaccion.descripcion ??
                                              transaccion.estado,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: ColoresVolt.textSecondary,
                                            fontFamily: 'Poppins',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Text(
                                  '${esIngreso ? '+' : '-'} Bs. ${transaccion.monto.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: color,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
