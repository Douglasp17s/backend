class Linea {
  final String id;
  final String numero;
  final String nombre;
  final String descripcion;
  final double precio;
  final String origen;
  final String destino;
  final double duracionEstimada;
  final int totalParadas;
  final bool activa;
  final List<String> conductoresIds;
  final DateTime createdAt;
  final DateTime updatedAt;

  Linea({
    required this.id,
    required this.numero,
    required this.nombre,
    required this.descripcion,
    required this.precio,
    required this.origen,
    required this.destino,
    required this.duracionEstimada,
    required this.totalParadas,
    required this.activa,
    required this.conductoresIds,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Linea.fromJson(Map<String, dynamic> json) {
    return Linea(
      id: json['id'] as String,
      numero: json['numero'] as String,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String? ?? '',
      precio: (json['precio'] as num).toDouble(),
      origen: json['origen'] as String,
      destino: json['destino'] as String,
      duracionEstimada: (json['duracionEstimada'] as num? ?? 0).toDouble(),
      totalParadas: json['totalParadas'] as int? ?? 0,
      activa: json['activa'] as bool? ?? true,
      conductoresIds: List<String>.from(json['conductoresIds'] as List? ?? []),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'numero': numero,
      'nombre': nombre,
      'descripcion': descripcion,
      'precio': precio,
      'origen': origen,
      'destino': destino,
      'duracionEstimada': duracionEstimada,
      'totalParadas': totalParadas,
      'activa': activa,
      'conductoresIds': conductoresIds,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Linea copyWith({
    String? id,
    String? numero,
    String? nombre,
    String? descripcion,
    double? precio,
    String? origen,
    String? destino,
    double? duracionEstimada,
    int? totalParadas,
    bool? activa,
    List<String>? conductoresIds,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Linea(
      id: id ?? this.id,
      numero: numero ?? this.numero,
      nombre: nombre ?? this.nombre,
      descripcion: descripcion ?? this.descripcion,
      precio: precio ?? this.precio,
      origen: origen ?? this.origen,
      destino: destino ?? this.destino,
      duracionEstimada: duracionEstimada ?? this.duracionEstimada,
      totalParadas: totalParadas ?? this.totalParadas,
      activa: activa ?? this.activa,
      conductoresIds: conductoresIds ?? this.conductoresIds,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
