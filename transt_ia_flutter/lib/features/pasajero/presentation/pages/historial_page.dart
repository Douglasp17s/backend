import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../config/tema/colores.dart';
import '../controllers/billetera_controller.dart';

class HistorialPage extends StatefulWidget {
  const HistorialPage({super.key});

  @override
  State<HistorialPage> createState() => _HistorialPageState();
}

class _HistorialPageState extends State<HistorialPage> {
  late BilleteraController controller;
  String _filtroSeleccionado = 'todos';

  @override
  void initState() {
    super.initState();
    controller = Get.find<BilleteraController>();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColoresVolt.background,
      appBar: AppBar(
        title: const Text('Historial de Transacciones'),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Filtros
          Padding(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFiltroChip('Todas', 'todos'),
                  const SizedBox(width: 8),
                  _buildFiltroChip('Ingresos', 'ingresos'),
                  const SizedBox(width: 8),
                  _buildFiltroChip('Gastos', 'gastos'),
                ],
              ),
            ),
          ),

          // Lista de transacciones
          Expanded(
            child: Obx(
              () {
                List transacciones = [];

                if (_filtroSeleccionado == 'todos') {
                  transacciones = controller.transacciones;
                } else if (_filtroSeleccionado == 'ingresos') {
                  transacciones = controller.obtenerTransaccionesIngresos();
                } else if (_filtroSeleccionado == 'gastos') {
                  transacciones = controller.obtenerTransaccionesGastos();
                }

                if (transacciones.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.receipt_long,
                          size: 64,
                          color: ColoresVolt.textSecondary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No hay transacciones',
                          style: TextStyle(
                            fontSize: 16,
                            color: ColoresVolt.textSecondary,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: transacciones.length,
                  itemBuilder: (context, index) {
                    final transaccion = transacciones[index];
                    final esIngreso = transaccion.tipo == 'INGRESO' ||
                        transaccion.tipo == 'RECARGA';
                    final color = esIngreso
                        ? ColoresVolt.success
                        : ColoresVolt.error;

                    return GestureDetector(
                      onTap: () => _mostrarDetallesTransaccion(transaccion),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: ColoresVolt.backgroundSecondary,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ColoresVolt.borderColor),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Icon(
                                  esIngreso
                                      ? Icons.arrow_upward
                                      : Icons.arrow_downward,
                                  color: color,
                                  size: 24,
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
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
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${esIngreso ? '+' : '-'} Bs. ${transaccion.monto.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: color,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    transaccion.estado,
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: color,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFiltroChip(String label, String valor) {
    final seleccionado = _filtroSeleccionado == valor;

    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          color: seleccionado
              ? ColoresVolt.background
              : ColoresVolt.textPrimary,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
      ),
      selected: seleccionado,
      onSelected: (selected) {
        setState(() => _filtroSeleccionado = valor);
      },
      backgroundColor: ColoresVolt.backgroundSecondary,
      selectedColor: ColoresVolt.primary,
      side: BorderSide(
        color: seleccionado ? ColoresVolt.primary : ColoresVolt.borderColor,
      ),
    );
  }

  void _mostrarDetallesTransaccion(dynamic transaccion) {
    showModalBottomSheet(
      context: context,
      backgroundColor: ColoresVolt.backgroundSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Detalles',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: ColoresVolt.textPrimary,
                    fontFamily: 'Poppins',
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Icon(
                    Icons.close,
                    color: ColoresVolt.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetalleRow('Tipo', transaccion.tipo),
            _buildDetalleRow('Monto', 'Bs. ${transaccion.monto.toStringAsFixed(2)}'),
            _buildDetalleRow('Estado', transaccion.estado),
            if (transaccion.descripcion != null)
              _buildDetalleRow('Descripcion', transaccion.descripcion),
            if (transaccion.txHash != null)
              _buildDetalleRow(
                'Tx Hash',
                transaccion.txHash!.substring(0, 20) + '...',
              ),
            if (transaccion.blockNumber != null)
              _buildDetalleRow('Bloque', transaccion.blockNumber.toString()),
            _buildDetalleRow(
              'Fecha',
              transaccion.createdAt.toString().split('.')[0],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetalleRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
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
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: ColoresVolt.textPrimary,
                fontFamily: 'Poppins',
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
