import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/configuracion.dart';

/// Servicio base para comunicación con API
/// Usa la configuración centralizada para la URL base
class ApiServicio {
  late final Dio _dio;
  late final SharedPreferences _prefs;

  /// Inicializa el cliente HTTP y la preferencias
  Future<void> inicializar() async {
    _prefs = await SharedPreferences.getInstance();

    /// Validar configuración en producción
    config.validar();

    _dio = Dio(
      BaseOptions(
        baseUrl: config.apiUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    /// Interceptor para agregar token JWT automáticamente
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = _prefs.getString('tokenAcceso');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          /// Manejar errores de red (logging, retry, etc)
          return handler.next(error);
        },
      ),
    );
  }

  Future<dynamic> obtener(String ruta) async {
    try {
      final respuesta = await _dio.get(ruta);
      return respuesta.data;
    } on DioException catch (e) {
      _manejarError(e);
    }
  }

  Future<dynamic> post(String ruta, {required Map<String, dynamic> datos}) async {
    try {
      final respuesta = await _dio.post(ruta, data: datos);
      // Debug: imprimir respuesta
      // ignore: avoid_print
      print('[API POST $ruta] Response: ${respuesta.data}');
      return respuesta.data;
    } on DioException catch (e) {
      _manejarError(e);
    }
  }

  Future<dynamic> patch(String ruta, {required Map<String, dynamic> datos}) async {
    try {
      final respuesta = await _dio.patch(ruta, data: datos);
      return respuesta.data;
    } on DioException catch (e) {
      _manejarError(e);
    }
  }

  void _manejarError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout) {
      throw Exception('Timeout de conexión');
    } else if (error.type == DioExceptionType.receiveTimeout) {
      throw Exception('El servidor tardó demasiado');
    } else if (error.response != null) {
      final mensaje = error.response?.data['message'] ?? 'Error desconocido';
      throw Exception(mensaje);
    } else {
      throw Exception('No hay conexión a internet');
    }
  }

  void guardarToken(String token, String tokenActualizacion) {
    _prefs.setString('tokenAcceso', token);
    _prefs.setString('tokenActualizacion', tokenActualizacion);
  }

  String? obtenerToken() => _prefs.getString('tokenAcceso');

  Future<void> limpiarToken() async {
    await _prefs.remove('tokenAcceso');
    await _prefs.remove('tokenActualizacion');
  }

  Dio get dio => _dio;
}
