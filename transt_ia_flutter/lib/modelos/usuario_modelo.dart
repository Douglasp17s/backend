/// Modelo de Usuario
class UsuarioModelo {
  final String id;
  final String nombre;
  final String email;
  final String? telefono;
  final String rol; // PASSENGER o DRIVER
  final bool activo;
  final DateTime creadoEn;

  UsuarioModelo({
    required this.id,
    required this.nombre,
    required this.email,
    this.telefono,
    required this.rol,
    required this.activo,
    required this.creadoEn,
  });

  factory UsuarioModelo.desdeJson(Map<String, dynamic> json) {
    // Debug
    // ignore: avoid_print
    print('DEBUG UsuarioModelo.desdeJson: $json');

    return UsuarioModelo(
      id: (json['id'] ?? '').toString(),
      nombre: (json['nombre'] ?? 'Usuario') as String,
      email: (json['email'] ?? '') as String,
      telefono: json['telefono'] as String?,
      rol: (json['rol'] ?? 'PASSENGER') as String,
      activo: json['activo'] as bool? ?? true,
      creadoEn: json['creadoEn'] != null
        ? DateTime.parse(json['creadoEn'] as String)
        : DateTime.now(),
    );
  }

  Map<String, dynamic> aJson() => {
    'id': id,
    'nombre': nombre,
    'email': email,
    'telefono': telefono,
    'rol': rol,
    'activo': activo,
    'creadoEn': creadoEn.toIso8601String(),
  };

  bool get esCliente => rol == 'PASSENGER';
  bool get esConductor => rol == 'DRIVER';
}
