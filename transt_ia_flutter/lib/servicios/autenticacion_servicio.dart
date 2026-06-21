import 'package:shared_preferences/shared_preferences.dart';
import '../modelos/autenticacion_modelo.dart';
import '../modelos/usuario_modelo.dart';
import 'api_servicio.dart';

/// Servicio de autenticación
class AutenticacionServicio {
  final ApiServicio _api;
  late final SharedPreferences _prefs;

  AutenticacionServicio(this._api);

  Future<void> inicializar() async {
    _prefs = await SharedPreferences.getInstance();
  }

  /// Iniciar sesión con email y contraseña
  Future<AutenticacionModelo> login({
    required String email,
    required String password,
  }) async {
    try {
      final respuesta = await _api.post(
        '/auth/login',
        datos: {'email': email, 'password': password},
      );

      final datos = respuesta is Map ? respuesta['data'] ?? respuesta : respuesta;
      final auth = AutenticacionModelo.desdeJson(datos as Map<String, dynamic>);
      _api.guardarToken(auth.tokenAcceso, auth.tokenActualizacion);

      // Guardar usuario actual
      await _prefs.setString('usuarioActual', email);
      await _prefs.setString('rolUsuario', auth.usuario.rol);

      return auth;
    } catch (e) {
      rethrow;
    }
  }

  /// Registrar nuevo usuario (cliente)
  Future<AutenticacionModelo> registroCliente({
    required String nombre,
    required String email,
    required String password,
    String? telefono,
  }) async {
    try {
      final respuesta = await _api.post(
        '/auth/register',
        datos: {
          'nombre': nombre,
          'email': email,
          'password': password,
          'telefono': telefono,
        },
      );

      final datos = respuesta is Map ? respuesta['data'] ?? respuesta : respuesta;
      final auth = AutenticacionModelo.desdeJson(datos as Map<String, dynamic>);
      _api.guardarToken(auth.tokenAcceso, auth.tokenActualizacion);

      return auth;
    } catch (e) {
      rethrow;
    }
  }

  /// Cerrar sesión
  Future<void> logout() async {
    try {
      await _api.post('/auth/logout', datos: {});
      _api.limpiarToken();
      await _prefs.remove('usuarioActual');
      await _prefs.remove('rolUsuario');
    } catch (e) {
      rethrow;
    }
  }

  /// Obtener usuario autenticado actual
  UsuarioModelo? obtenerUsuarioActual() {
    final email = _prefs.getString('usuarioActual');
    return email != null ? UsuarioModelo(
      id: '',
      nombre: '',
      email: email,
      rol: _prefs.getString('rolUsuario') ?? 'PASSENGER',
      activo: true,
      creadoEn: DateTime.now(),
    ) : null;
  }

  /// Verificar si el usuario está autenticado
  bool estaAutenticado() => _api.obtenerToken() != null;

  /// Obtener rol del usuario actual
  String? obtenerRol() => _prefs.getString('rolUsuario');
}
