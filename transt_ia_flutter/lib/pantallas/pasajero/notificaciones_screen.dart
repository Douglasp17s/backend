import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:transit_ai/services/notificacion_push_service.dart';

/// Pantalla de notificaciones del pasajero
/// Muestra todas las notificaciones recibidas, permite marcar como leída y eliminar
class NotificacionesScreen extends StatefulWidget {
  const NotificacionesScreen({Key? key}) : super(key: key);

  @override
  State<NotificacionesScreen> createState() => _NotificacionesScreenState();
}

class _NotificacionesScreenState extends State<NotificacionesScreen> {
  final NotificacionPushService _notificacionService = NotificacionPushService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        elevation: 0,
        backgroundColor: const Color(0xFF00d992),
        foregroundColor: const Color(0xFF0f0f0f),
        actions: [
          Obx(() {
            final totalNotif = _notificacionService.notificaciones.length;
            if (totalNotif > 0) {
              return Padding(
                padding: const EdgeInsets.all(16.0),
                child: Center(
                  child: Text(
                    '$totalNotif',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0f0f0f),
                    ),
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
      body: Container(
        color: const Color(0xFF0f0f0f),
        child: Obx(() {
          final notificaciones = _notificacionService.notificaciones;

          if (notificaciones.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none,
                    size: 64,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No tienes notificaciones',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[400],
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: notificaciones.length,
            itemBuilder: (context, index) {
              final notif = notificaciones[notificaciones.length - 1 - index];
              return _ConstructorNotificacion(
                notificacion: notif,
                onMarcarLeida: () => _marcarLeida(notif['id']),
                onEliminar: () => _eliminarNotificacion(notif['id']),
              );
            },
          );
        }),
      ),
    );
  }

  void _marcarLeida(String id) {
    _notificacionService.marcarComoLeida(id);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Notificación marcada como leída'),
        duration: Duration(seconds: 2),
        backgroundColor: Color(0xFF00d992),
      ),
    );
  }

  void _eliminarNotificacion(String id) {
    _notificacionService.eliminarNotificacion(id);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Notificación eliminada'),
        duration: Duration(seconds: 2),
        backgroundColor: Color(0xFF00d992),
      ),
    );
  }
}

/// Constructor de tarjeta de notificación
class _ConstructorNotificacion extends StatelessWidget {
  final Map<String, dynamic> notificacion;
  final VoidCallback onMarcarLeida;
  final VoidCallback onEliminar;

  const _ConstructorNotificacion({
    required this.notificacion,
    required this.onMarcarLeida,
    required this.onEliminar,
  });

  @override
  Widget build(BuildContext context) {
    final titulo = notificacion['titulo'] ?? 'Notificación';
    final mensaje = notificacion['mensaje'] ?? '';
    final fecha = notificacion['fecha'] ?? DateTime.now().toString();
    final leida = notificacion['leida'] ?? false;

    // Formatear fecha
    String fechaFormato = _formatearFecha(fecha);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: leida ? const Color(0xFF1a1a1a) : const Color(0xFF1a3a2a),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: leida ? Colors.grey[700]! : const Color(0xFF00d992),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        titulo,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF00d992),
                          decoration: leida ? TextDecoration.none : null,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        fechaFormato,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ),
                if (!leida)
                  Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      color: Color(0xFF00d992),
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              mensaje,
              style: TextStyle(
                fontSize: 14,
                color: const Color(0xFFe0e0e0),
                height: 1.5,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (!leida)
                  TextButton.icon(
                    onPressed: onMarcarLeida,
                    icon: const Icon(Icons.done_all, size: 18),
                    label: const Text('Leída'),
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFF00d992),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                const SizedBox(width: 8),
                TextButton.icon(
                  onPressed: onEliminar,
                  icon: const Icon(Icons.delete_outline, size: 18),
                  label: const Text('Eliminar'),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red[400],
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatearFecha(String fechaStr) {
    try {
      final fecha = DateTime.parse(fechaStr);
      final ahora = DateTime.now();
      final diferencia = ahora.difference(fecha);

      if (diferencia.inMinutes < 1) {
        return 'Ahora';
      } else if (diferencia.inMinutes < 60) {
        return 'hace ${diferencia.inMinutes} min';
      } else if (diferencia.inHours < 24) {
        return 'hace ${diferencia.inHours}h';
      } else if (diferencia.inDays < 7) {
        return 'hace ${diferencia.inDays} días';
      } else {
        return '${fecha.day}/${fecha.month}/${fecha.year}';
      }
    } catch (e) {
      return 'Fecha desconocida';
    }
  }
}
