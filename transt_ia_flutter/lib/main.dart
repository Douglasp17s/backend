import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'config/api/api_config.dart';
import 'config/rutas/app_routes.dart';
import 'config/tema/tema_app.dart';
import 'features/pasajero/presentation/pages/mapa_page.dart';
import 'features/pasajero/presentation/pages/rutas_favoritas_page.dart';
import 'features/pasajero/presentation/pages/billetera_page.dart';
import 'features/pasajero/presentation/pages/pagar_page.dart';
import 'features/pasajero/presentation/pages/historial_page.dart';
import 'models/linea.dart';
import 'services/notificacion_push_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Configurar handler de notificaciones en background
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  await ApiConfig.init();

  // Inicializar servicio de notificaciones
  NotificacionPushService().inicializar();

  runApp(const TransitAiApp());
}

class TransitAiApp extends StatelessWidget {
  const TransitAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Transit AI',
      theme: TemaApp.darkTheme,
      home: const MapaPage(),
      getPages: [
        GetPage(
          name: AppRoutes.principal,
          page: () => const MapaPage(),
        ),
        GetPage(
          name: AppRoutes.mapa,
          page: () => const MapaPage(),
        ),
        GetPage(
          name: AppRoutes.rutasFavoritas,
          page: () => const RutasFavoritasPage(),
        ),
        GetPage(
          name: AppRoutes.billetera,
          page: () => const BilleteraPage(),
        ),
        GetPage(
          name: '${AppRoutes.pagar}/:lineaId',
          page: () {
            final linea = Get.arguments as Linea;
            return PagarPage(linea: linea);
          },
        ),
        GetPage(
          name: AppRoutes.historial,
          page: () => const HistorialPage(),
        ),
      ],
      debugShowCheckedModeBanner: false,
    );
  }
}
