import 'package:intl/intl.dart';

/// Modelo de Turno para conductores
class Turno {
  final String id;
  final String conductorId;
  final String linea;
  final String estado; // INICIADO, EN_RUTA, COMPLETADO, CANCELADO
  final DateTime fechaInicio;
  final DateTime? fechaFin;
  final double gananciaTotal;
  final int paradasCompletadas;
  final int paradasTotales;
  final double latitudActual;
  final double longitudActual;
  final List<Parada> paradas;
  final String? proximaParada;

  Turno({
    required this.id,
    required this.conductorId,
    required this.linea,
    required this.estado,
    required this.fechaInicio,
    this.fechaFin,
    required this.gananciaTotal,
    required this.paradasCompletadas,
    required this.paradasTotales,
    required this.latitudActual,
    required this.longitudActual,
    required this.paradas,
    this.proximaParada,
  });

  /// Obtener duración del turno
  Duration obtenerDuracion() {
    final fin = fechaFin ?? DateTime.now();
    return fin.difference(fechaInicio);
  }

  /// Verificar si el turno está activo
  bool get estaActivo => estado == 'INICIADO' || estado == 'EN_RUTA';

  /// Calcular progreso de paradas (0.0 a 1.0)
  double obtenerProgreso() {
    if (paradasTotales == 0) return 0.0;
    return paradasCompletadas / paradasTotales;
  }

  factory Turno.fromJson(Map<String, dynamic> json) {
    return Turno(
      id: json['id'] as String,
      conductorId: json['conductorId'] as String,
      linea: json['linea'] as String,
      estado: json['estado'] as String,
      fechaInicio: DateTime.parse(json['fechaInicio'] as String),
      fechaFin: json['fechaFin'] != null
          ? DateTime.parse(json['fechaFin'] as String)
          : null,
      gananciaTotal: (json['gananciaTotal'] as num).toDouble(),
      paradasCompletadas: json['paradasCompletadas'] as int,
      paradasTotales: json['paradasTotales'] as int,
      latitudActual: (json['latitudActual'] as num).toDouble(),
      longitudActual: (json['longitudActual'] as num).toDouble(),
      paradas: (json['paradas'] as List<dynamic>?)
              ?.map((p) => Parada.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      proximaParada: json['proximaParada'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'conductorId': conductorId,
        'linea': linea,
        'estado': estado,
        'fechaInicio': fechaInicio.toIso8601String(),
        'fechaFin': fechaFin?.toIso8601String(),
        'gananciaTotal': gananciaTotal,
        'paradasCompletadas': paradasCompletadas,
        'paradasTotales': paradasTotales,
        'latitudActual': latitudActual,
        'longitudActual': longitudActual,
        'paradas': paradas.map((p) => p.toJson()).toList(),
        'proximaParada': proximaParada,
      };
}

/// Modelo de Parada dentro de un turno
class Parada {
  final String id;
  final String nombre;
  final double latitud;
  final double longitud;
  final int numeroSecuencia;
  final bool completada;
  final DateTime? horaLlegada;
  final int pasajerosRecogidos;

  Parada({
    required this.id,
    required this.nombre,
    required this.latitud,
    required this.longitud,
    required this.numeroSecuencia,
    required this.completada,
    this.horaLlegada,
    required this.pasajerosRecogidos,
  });

  factory Parada.fromJson(Map<String, dynamic> json) {
    return Parada(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      latitud: (json['latitud'] as num).toDouble(),
      longitud: (json['longitud'] as num).toDouble(),
      numeroSecuencia: json['numeroSecuencia'] as int,
      completada: json['completada'] as bool,
      horaLlegada: json['horaLlegada'] != null
          ? DateTime.parse(json['horaLlegada'] as String)
          : null,
      pasajerosRecogidos: json['pasajerosRecogidos'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre': nombre,
        'latitud': latitud,
        'longitud': longitud,
        'numeroSecuencia': numeroSecuencia,
        'completada': completada,
        'horaLlegada': horaLlegada?.toIso8601String(),
        'pasajerosRecogidos': pasajerosRecogidos,
      };
}

/// Modelo para Ganancias del día
class GananciasDia {
  final double total;
  final Map<String, double> porRuta;
  final Map<int, double> porHora;
  final DateTime fecha;

  GananciasDia({
    required this.total,
    required this.porRuta,
    required this.porHora,
    required this.fecha,
  });

  factory GananciasDia.fromJson(Map<String, dynamic> json) {
    return GananciasDia(
      total: (json['total'] as num).toDouble(),
      porRuta: Map<String, double>.from(
        (json['porRuta'] as Map<String, dynamic>).map(
          (key, value) => MapEntry(key, (value as num).toDouble()),
        ),
      ),
      porHora: Map<int, double>.from(
        (json['porHora'] as Map<String, dynamic>).map(
          (key, value) => MapEntry(int.parse(key), (value as num).toDouble()),
        ),
      ),
      fecha: DateTime.parse(json['fecha'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'total': total,
        'porRuta': porRuta,
        'porHora': porHora.map((key, value) => MapEntry(key.toString(), value)),
        'fecha': fecha.toIso8601String(),
      };
}
