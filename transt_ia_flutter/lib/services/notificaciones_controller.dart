import 'package:get/get.dart';
import 'notificacion_push_service.dart';

/// Controlador GetX para gestionar el estado de las notificaciones
class NotificacionesController extends GetxController {
  final NotificacionPushService _notificacionService = NotificacionPushService();

  final Rx<int> totalNotificaciones = 0.obs;
  final Rx<int> notificacionesNoLeidas = 0.obs;
  final RxList<Map<String, dynamic>> notificaciones = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    _inicializar();
  }

  /// Inicializa el servicio de notificaciones
  Future<void> _inicializar() async {
    await _notificacionService.inicializar();
    _actualizarEstadisticas();
  }

  /// Actualiza las estadísticas de notificaciones
  void _actualizarEstadisticas() {
    final notifs = _notificacionService.obtenerNotificaciones();
    notificaciones.value = notifs;
    totalNotificaciones.value = notifs.length;
    notificacionesNoLeidas.value = notifs.where((n) => n['leida'] == false).length;
  }

  /// Marca una notificación como leída
  void marcarComoLeida(String id) {
    _notificacionService.marcarComoLeida(id);
    _actualizarEstadisticas();
  }

  /// Elimina una notificación
  void eliminarNotificacion(String id) {
    _notificacionService.eliminarNotificacion(id);
    _actualizarEstadisticas();
  }

  /// Obtiene el token FCM
  String obtenerTokenFCM() {
    return _notificacionService.obtenerTokenFCM();
  }

  /// Registra el token FCM en el backend
  Future<void> registrarTokenEnBackend(String usuarioId) async {
    final token = _notificacionService.obtenerTokenFCM();
    await _notificacionService.registrarTokenEnBackend(usuarioId, token);
  }

  /// Limpia todas las notificaciones
  void limpiarNotificaciones() {
    _notificacionService.limpiarNotificaciones();
    _actualizarEstadisticas();
  }

  /// Observa los cambios en notificaciones (para escuchar en tiempo real)
  void escucharNotificaciones() {
    ever(_notificacionService.notificaciones, (_) {
      _actualizarEstadisticas();
    });
  }
}
