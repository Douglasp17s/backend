/// Modelo de Ruta para conductores
class Ruta {
  final String id;
  final String nombre;
  final String codigo;
  final String estado;
  final List<PuntoRuta> puntos;
  final double distanciaKm;
  final int tiempoEstimadoMinutos;
  final DateTime proximaSalida;
  final int conductoresAsignados;

  Ruta({
    required this.id,
    required this.nombre,
    required this.codigo,
    required this.estado,
    required this.puntos,
    required this.distanciaKm,
    required this.tiempoEstimadoMinutos,
    required this.proximaSalida,
    required this.conductoresAsignados,
  });

  factory Ruta.fromJson(Map<String, dynamic> json) {
    return Ruta(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      codigo: json['codigo'] as String,
      estado: json['estado'] as String,
      puntos: (json['puntos'] as List<dynamic>?)
              ?.map((p) => PuntoRuta.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      distanciaKm: (json['distanciaKm'] as num).toDouble(),
      tiempoEstimadoMinutos: json['tiempoEstimadoMinutos'] as int,
      proximaSalida: DateTime.parse(json['proximaSalida'] as String),
      conductoresAsignados: json['conductoresAsignados'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre': nombre,
        'codigo': codigo,
        'estado': estado,
        'puntos': puntos.map((p) => p.toJson()).toList(),
        'distanciaKm': distanciaKm,
        'tiempoEstimadoMinutos': tiempoEstimadoMinutos,
        'proximaSalida': proximaSalida.toIso8601String(),
        'conductoresAsignados': conductoresAsignados,
      };
}

/// Punto de una ruta (parada o punto de interés)
class PuntoRuta {
  final String id;
  final String nombre;
  final double latitud;
  final double longitud;
  final int orden;
  final String tipo; // PARADA, INICIO, FIN

  PuntoRuta({
    required this.id,
    required this.nombre,
    required this.latitud,
    required this.longitud,
    required this.orden,
    required this.tipo,
  });

  factory PuntoRuta.fromJson(Map<String, dynamic> json) {
    return PuntoRuta(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      latitud: (json['latitud'] as num).toDouble(),
      longitud: (json['longitud'] as num).toDouble(),
      orden: json['orden'] as int,
      tipo: json['tipo'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre': nombre,
        'latitud': latitud,
        'longitud': longitud,
        'orden': orden,
        'tipo': tipo,
      };
}
