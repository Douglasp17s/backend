/// Configuración centralizada de variables de entorno
///
/// NOTA: Los valores por defecto están configurados para DESARROLLO LOCAL
/// En PRODUCCIÓN, estos valores deben ser proporcionados vía --dart-define
///
/// Ejemplo de build para desarrollo:
///   flutter run --dart-define=API_URL=http://localhost:4000
///
/// Ejemplo de build para producción:
///   flutter build apk --dart-define=API_URL=https://api.transit-ai.com
library;

const String _apiUrlDefault = 'http://192.168.1.8:4000';
const String _googleMapsApiKeyDefault = 'tu_google_maps_api_key';

/// Clase singleton para configuración de la aplicación
class Configuracion {
  static final Configuracion _instancia = Configuracion._interno();

  late final String apiUrl;
  late final String googleMapsApiKey;
  late final bool isProduccion;

  /// Acceso via const
  static const String nombreApp = 'Transit AI';
  static const String versionApp = '1.0.0';

  factory Configuracion() {
    return _instancia;
  }

  Configuracion._interno() {
    /// Leer desde --dart-define o usar defaults
    apiUrl = const String.fromEnvironment(
      'API_URL',
      defaultValue: _apiUrlDefault,
    );

    googleMapsApiKey = const String.fromEnvironment(
      'GOOGLE_MAPS_API_KEY',
      defaultValue: _googleMapsApiKeyDefault,
    );

    /// Detectar si es producción
    isProduccion = const bool.fromEnvironment(
      'IS_PRODUCTION',
      defaultValue: false,
    );

    /// Log de configuración (solo en desarrollo)
    if (!isProduccion) {
      debugPrintConfig('[CONFIG] API URL: $apiUrl');
      debugPrintConfig(
        '[CONFIG] Environment: ${isProduccion ? "Producción" : "Desarrollo"}',
      );
    }
  }

  /// Verifica que las variables críticas estén configuradas
  void validar() {
    if (apiUrl == _apiUrlDefault && isProduccion) {
      throw Exception(
        'CONFIGURACIÓN INVÁLIDA EN PRODUCCIÓN: API_URL no fue definida. '
        'Usa: flutter build apk --dart-define=API_URL=https://...',
      );
    }

    if (googleMapsApiKey == _googleMapsApiKeyDefault && !isProduccion) {
      debugPrintConfig(
        '[ADVERTENCIA] GOOGLE_MAPS_API_KEY no configurada. '
        'Los mapas no funcionarán correctamente.',
      );
    }
  }
}

/// Función auxiliar para debug (solo en desarrollo)
void debugPrintConfig(String mensaje) {
  assert(() {
    // ignore: avoid_print
    print(mensaje);
    return true;
  }());
}

/// Getter para acceso más cómodo
Configuracion get config => Configuracion();
