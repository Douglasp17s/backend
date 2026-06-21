import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:async';
import 'package:get/get.dart';

/// Servicio de notificaciones push Firebase
/// Maneja el registro de tokens FCM, recepción de mensajes y notificaciones locales
class NotificacionPushService {
  static final NotificacionPushService _instance = NotificacionPushService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  final RxList<Map<String, dynamic>> notificaciones = <Map<String, dynamic>>[].obs;
  final RxString fcmToken = ''.obs;

  NotificacionPushService._internal();

  factory NotificacionPushService() {
    return _instance;
  }

  /// Inicializa el servicio de notificaciones
  Future<void> inicializar() async {
    try {
      // Configurar permisos
      await _firebaseMessaging.requestPermission();

      // Obtener token FCM
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        fcmToken.value = token;
        print('FCM Token: $token');
      }

      // Listener cuando se obtiene un nuevo token
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        fcmToken.value = newToken;
        print('Nuevo FCM Token: $newToken');
        // Aquí deberías enviar el token al backend
      });

      // Configurar notificaciones locales
      await _inicializarNotificacionesLocales();

      // Listener para mensajes en primer plano
      FirebaseMessaging.onMessage.listen(_handleMensajeEnPrimerPlano);

      // Listener para cuando la app está terminada
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMensajeAppTerminada);

      // Obtener mensaje inicial si la app se abrió desde una notificación
      RemoteMessage? inicialMessage = await _firebaseMessaging.getInitialMessage();
      if (inicialMessage != null) {
        _handleMensajeAppTerminada(inicialMessage);
      }

      print('NotificacionPushService inicializado correctamente');
    } catch (e) {
      print('Error inicializando NotificacionPushService: $e');
    }
  }

  /// Inicializa las notificaciones locales
  Future<void> _inicializarNotificacionesLocales() async {
    const AndroidInitializationSettings androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidInit,
      iOS: iosInit,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        if (response.payload != null) {
          print('Payload: ${response.payload}');
        }
      },
    );
  }

  /// Maneja mensajes recibidos cuando la app está en primer plano
  void _handleMensajeEnPrimerPlano(RemoteMessage message) {
    print('Mensaje en primer plano: ${message.notification?.title}');

    final notif = {
      'id': message.messageId,
      'titulo': message.notification?.title ?? 'Notificación',
      'mensaje': message.notification?.body ?? '',
      'fecha': DateTime.now().toString(),
      'leida': false,
      'datos': message.data,
    };

    notificaciones.add(notif);
    _mostrarNotificacionLocal(notif);
  }

  /// Maneja mensajes cuando la app estaba terminada
  void _handleMensajeAppTerminada(RemoteMessage message) {
    print('Mensaje desde app terminada: ${message.notification?.title}');

    final notif = {
      'id': message.messageId,
      'titulo': message.notification?.title ?? 'Notificación',
      'mensaje': message.notification?.body ?? '',
      'fecha': DateTime.now().toString(),
      'leida': false,
      'datos': message.data,
    };

    notificaciones.add(notif);
  }

  /// Muestra una notificación local
  Future<void> _mostrarNotificacionLocal(Map<String, dynamic> notif) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'transit_ai_channel',
      'Transit AI Notificaciones',
      channelDescription: 'Notificaciones del sistema Transit AI',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails platformDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notif['id'].hashCode,
      notif['titulo'],
      notif['mensaje'],
      platformDetails,
      payload: notif['id'],
    );
  }

  /// Obtiene todas las notificaciones
  List<Map<String, dynamic>> obtenerNotificaciones() {
    return notificaciones.toList();
  }

  /// Marca una notificación como leída
  void marcarComoLeida(String id) {
    final index = notificaciones.indexWhere((n) => n['id'] == id);
    if (index != -1) {
      notificaciones[index]['leida'] = true;
      notificaciones.refresh();
    }
  }

  /// Elimina una notificación
  void eliminarNotificacion(String id) {
    notificaciones.removeWhere((n) => n['id'] == id);
    notificaciones.refresh();
  }

  /// Limpia todas las notificaciones
  void limpiarNotificaciones() {
    notificaciones.clear();
  }

  /// Obtiene el token FCM actual
  String obtenerTokenFCM() {
    return fcmToken.value;
  }

  /// Registra el token FCM en el backend (debe ser llamado después de login)
  Future<void> registrarTokenEnBackend(String usuarioId, String token) async {
    try {
      // Esta función debe ser implementada en tu API service
      // await apiService.post('/notificaciones/fcm-token', {
      //   'usuarioId': usuarioId,
      //   'fcmToken': token,
      // });
      print('Token registrado en backend para usuario: $usuarioId');
    } catch (e) {
      print('Error registrando token en backend: $e');
    }
  }
}

/// Handler para mensajes en segundo plano (debe estar fuera de la clase)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Manejando mensaje en background: ${message.notification?.title}');
}
