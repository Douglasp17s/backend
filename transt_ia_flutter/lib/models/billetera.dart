class Billetera {
  final String id;
  final String usuarioId;
  final double saldo;
  final double saldoBs;
  final String moneda;
  final String direccionBlockchain;
  final bool activa;
  final DateTime createdAt;
  final DateTime updatedAt;

  Billetera({
    required this.id,
    required this.usuarioId,
    required this.saldo,
    required this.saldoBs,
    required this.moneda,
    required this.direccionBlockchain,
    required this.activa,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Billetera.fromJson(Map<String, dynamic> json) {
    return Billetera(
      id: json['id'] as String,
      usuarioId: json['usuarioId'] as String,
      saldo: (json['saldo'] as num).toDouble(),
      saldoBs: (json['saldoBs'] as num).toDouble(),
      moneda: json['moneda'] as String? ?? 'USD',
      direccionBlockchain: json['direccionBlockchain'] as String? ?? '',
      activa: json['activa'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'usuarioId': usuarioId,
      'saldo': saldo,
      'saldoBs': saldoBs,
      'moneda': moneda,
      'direccionBlockchain': direccionBlockchain,
      'activa': activa,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Billetera copyWith({
    String? id,
    String? usuarioId,
    double? saldo,
    double? saldoBs,
    String? moneda,
    String? direccionBlockchain,
    bool? activa,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Billetera(
      id: id ?? this.id,
      usuarioId: usuarioId ?? this.usuarioId,
      saldo: saldo ?? this.saldo,
      saldoBs: saldoBs ?? this.saldoBs,
      moneda: moneda ?? this.moneda,
      direccionBlockchain: direccionBlockchain ?? this.direccionBlockchain,
      activa: activa ?? this.activa,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class TransaccionBilletera {
  final String id;
  final String billeteraId;
  final double monto;
  final String tipo;
  final String estado;
  final String? descripcion;
  final String? txHash;
  final int? blockNumber;
  final DateTime createdAt;
  final DateTime updatedAt;

  TransaccionBilletera({
    required this.id,
    required this.billeteraId,
    required this.monto,
    required this.tipo,
    required this.estado,
    this.descripcion,
    this.txHash,
    this.blockNumber,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TransaccionBilletera.fromJson(Map<String, dynamic> json) {
    return TransaccionBilletera(
      id: json['id'] as String,
      billeteraId: json['billeteraId'] as String,
      monto: (json['monto'] as num).toDouble(),
      tipo: json['tipo'] as String,
      estado: json['estado'] as String,
      descripcion: json['descripcion'] as String?,
      txHash: json['txHash'] as String?,
      blockNumber: json['blockNumber'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'billeteraId': billeteraId,
      'monto': monto,
      'tipo': tipo,
      'estado': estado,
      'descripcion': descripcion,
      'txHash': txHash,
      'blockNumber': blockNumber,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  TransaccionBilletera copyWith({
    String? id,
    String? billeteraId,
    double? monto,
    String? tipo,
    String? estado,
    String? descripcion,
    String? txHash,
    int? blockNumber,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return TransaccionBilletera(
      id: id ?? this.id,
      billeteraId: billeteraId ?? this.billeteraId,
      monto: monto ?? this.monto,
      tipo: tipo ?? this.tipo,
      estado: estado ?? this.estado,
      descripcion: descripcion ?? this.descripcion,
      txHash: txHash ?? this.txHash,
      blockNumber: blockNumber ?? this.blockNumber,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
