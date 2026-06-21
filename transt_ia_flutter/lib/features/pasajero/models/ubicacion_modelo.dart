class UbicacionModelo {
  final double latitud;
  final double longitud;
  final double precision;
  final DateTime timestamp;

  UbicacionModelo({
    required this.latitud,
    required this.longitud,
    required this.precision,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory UbicacionModelo.fromJson(Map<String, dynamic> json) {
    return UbicacionModelo(
      latitud: (json['latitud'] as num).toDouble(),
      longitud: (json['longitud'] as num).toDouble(),
      precision: (json['precision'] as num? ?? 0).toDouble(),
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitud': latitud,
      'longitud': longitud,
      'precision': precision,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  UbicacionModelo copyWith({
    double? latitud,
    double? longitud,
    double? precision,
    DateTime? timestamp,
  }) {
    return UbicacionModelo(
      latitud: latitud ?? this.latitud,
      longitud: longitud ?? this.longitud,
      precision: precision ?? this.precision,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
