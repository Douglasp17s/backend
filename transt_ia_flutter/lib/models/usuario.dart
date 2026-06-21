class Usuario {
  final String id;
  final String nombre;
  final String email;
  final String? telefono;
  final String? fotoPerfil;
  final String? direccion;
  final String rol;
  final bool verificado;
  final DateTime createdAt;
  final DateTime updatedAt;

  Usuario({
    required this.id,
    required this.nombre,
    required this.email,
    this.telefono,
    this.fotoPerfil,
    this.direccion,
    required this.rol,
    required this.verificado,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      email: json['email'] as String,
      telefono: json['telefono'] as String?,
      fotoPerfil: json['fotoPerfil'] as String?,
      direccion: json['direccion'] as String?,
      rol: json['rol'] as String? ?? 'PASAJERO',
      verificado: json['verificado'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'email': email,
      'telefono': telefono,
      'fotoPerfil': fotoPerfil,
      'direccion': direccion,
      'rol': rol,
      'verificado': verificado,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Usuario copyWith({
    String? id,
    String? nombre,
    String? email,
    String? telefono,
    String? fotoPerfil,
    String? direccion,
    String? rol,
    bool? verificado,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Usuario(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      email: email ?? this.email,
      telefono: telefono ?? this.telefono,
      fotoPerfil: fotoPerfil ?? this.fotoPerfil,
      direccion: direccion ?? this.direccion,
      rol: rol ?? this.rol,
      verificado: verificado ?? this.verificado,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
