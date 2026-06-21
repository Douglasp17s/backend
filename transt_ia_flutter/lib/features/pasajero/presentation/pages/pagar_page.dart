import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores.dart';
import '../../../../models/linea.dart';
import '../controllers/billetera_controller.dart';
import '../widgets/boton_redondeado.dart';

class PagarPage extends StatefulWidget {
  final Linea linea;

  const PagarPage({
    super.key,
    required this.linea,
  });

  @override
  State<PagarPage> createState() => _PagarPageState();
}

class _PagarPageState extends State<PagarPage> {
  late BilleteraController billeteraController;
  String _metodoPago = 'billetera';

  @override
  void initState() {
    super.initState();
    billeteraController = Get.find<BilleteraController>();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColoresVolt.background,
      appBar: AppBar(
        title: const Text('Confirmar Pago'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Resumen de viaje
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ColoresVolt.backgroundSecondary,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ColoresVolt.borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Resumen del Viaje',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: ColoresVolt.textPrimary,
                        fontFamily: 'Poppins',
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildResumenRow(
                      'Linea',
                      '${widget.linea.numero} - ${widget.linea.nombre}',
                    ),
                    _buildResumenRow(
                      'Ruta',
                      '${widget.linea.origen} a ${widget.linea.destino}',
                    ),
                    _buildResumenRow(
                      'Tiempo Estimado',
                      '${widget.linea.duracionEstimada.toStringAsFixed(0)} minutos',
                    ),
                    const Divider(color: ColoresVolt.borderColor),
                    _buildResumenRow(
                      'Tarifa Base',
                      'Bs. ${widget.linea.precio.toStringAsFixed(2)}',
                    ),
                    _buildResumenRow(
                      'Descuento (10%)',
                      '-Bs. ${(widget.linea.precio * 0.1).toStringAsFixed(2)}',
                      color: ColoresVolt.success,
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: ColoresVolt.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total a Pagar',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: ColoresVolt.textPrimary,
                              fontFamily: 'Poppins',
                            ),
                          ),
                          Text(
                            'Bs. ${(widget.linea.precio * 0.9).toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: ColoresVolt.primary,
                              fontFamily: 'Poppins',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Metodo de pago
              Text(
                'Metodo de Pago',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: ColoresVolt.textPrimary,
                  fontFamily: 'Poppins',
                ),
              ),
              const SizedBox(height: 12),
              _buildMetodoPago(
                'Billetera',
                'Pagar con saldo disponible',
                'billetera',
                Icons.wallet,
              ),
              const SizedBox(height: 12),
              _buildMetodoPago(
                'Tarjeta de Credito',
                'Stripe payment gateway',
                'tarjeta',
                Icons.credit_card,
              ),
              const SizedBox(height: 24),

              // Saldo actual
              Obx(
                () => Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: ColoresVolt.backgroundSecondary,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ColoresVolt.borderColor),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Saldo Disponible',
                        style: TextStyle(
                          fontSize: 14,
                          color: ColoresVolt.textSecondary,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      Text(
                        billeteraController.obtenerSaldoFormateado(),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: ColoresVolt.primary,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Botones
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: ColoresVolt.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(50),
                        ),
                      ),
                      child: Text(
                        'Cancelar',
                        style: TextStyle(
                          color: ColoresVolt.primary,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Obx(
                      () => BotonRedondeado(
                        texto: 'Confirmar Pago',
                        cargando: billeteraController.procesandoPago.value,
                        onPressed: () {
                          if (_metodoPago == 'billetera') {
                            billeteraController.pagar(
                              lineaId: widget.linea.id,
                              monto: widget.linea.precio * 0.9,
                            );
                          } else {
                            Get.snackbar(
                              'Proxy',
                              'Metodo de pago con tarjeta no implementado aun',
                              snackPosition: SnackPosition.BOTTOM,
                            );
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResumenRow(
    String label,
    String value, {
    Color? color,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: ColoresVolt.textSecondary,
              fontFamily: 'Poppins',
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: color ?? ColoresVolt.textPrimary,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetodoPago(
    String titulo,
    String descripcion,
    String valor,
    IconData icono,
  ) {
    final seleccionado = _metodoPago == valor;

    return GestureDetector(
      onTap: () => setState(() => _metodoPago = valor),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: seleccionado
              ? ColoresVolt.primary.withValues(alpha: 0.1)
              : ColoresVolt.backgroundSecondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: seleccionado ? ColoresVolt.primary : ColoresVolt.borderColor,
            width: seleccionado ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color:
                    seleccionado ? ColoresVolt.primary : ColoresVolt.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icono,
                color: seleccionado
                    ? ColoresVolt.background
                    : ColoresVolt.textSecondary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titulo,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: ColoresVolt.textPrimary,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    descripcion,
                    style: TextStyle(
                      fontSize: 12,
                      color: ColoresVolt.textSecondary,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: valor,
              groupValue: _metodoPago,
              onChanged: (value) {
                if (value != null) {
                  setState(() => _metodoPago = value);
                }
              },
              activeColor: ColoresVolt.primary,
            ),
          ],
        ),
      ),
    );
  }
}
