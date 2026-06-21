import 'usuario_modelo.dart';

/// Modelo de respuesta de autenticación
class AutenticacionModelo {
  final UsuarioModelo usuario;
  final String tokenAcceso;
  final String tokenActualizacion;

  AutenticacionModelo({
    required this.usuario,
    required this.tokenAcceso,
    required this.tokenActualizacion,
  });

  factory AutenticacionModelo.desdeJson(Map<String, dynamic> json) {
    // Debug: imprimir la respuesta recibida
    // ignore: avoid_print
    print('DEBUG AutenticacionModelo.desdeJson: $json');

    return AutenticacionModelo(
      usuario: UsuarioModelo.desdeJson(json['usuario'] as Map<String, dynamic>),
      tokenAcceso: json['accessToken'] as String? ?? '',
      tokenActualizacion: json['refreshToken'] as String? ?? '',
    );
  }
}
