import '../../../../../../services/api_service.dart';

class IaService {
  static const String _endpoint = '/ia';

  static Future<Map<String, dynamic>> obtenerETA({
    required double latOrigen,
    required double lonOrigen,
    required double latDestino,
    required double lonDestino,
    required String lineaId,
  }) async {
    return await ApiService.custom(
      'POST',
      '$_endpoint/eta',
      data: {
        'latOrigen': latOrigen,
        'lonOrigen': lonOrigen,
        'latDestino': latDestino,
        'lonDestino': lonDestino,
        'lineaId': lineaId,
      },
    );
  }

  static Future<Map<String, dynamic>> obtenerNivelCongestion({
    required String lineaId,
  }) async {
    return await ApiService.custom(
      'GET',
      '$_endpoint/congestion/$lineaId',
    );
  }

  static Future<Map<String, dynamic>> obtenerRecomendaciones({
    required double latOrigen,
    required double lonOrigen,
  }) async {
    return await ApiService.custom(
      'POST',
      '$_endpoint/recomendaciones',
      data: {
        'latOrigen': latOrigen,
        'lonOrigen': lonOrigen,
      },
    );
  }

  static Future<List<Map<String, dynamic>>> obtenerRutasOptimizadas({
    required double latOrigen,
    required double lonOrigen,
    required double latDestino,
    required double lonDestino,
  }) async {
    final response = await ApiService.custom(
      'POST',
      '$_endpoint/rutas-optimizadas',
      data: {
        'latOrigen': latOrigen,
        'lonOrigen': lonOrigen,
        'latDestino': latDestino,
        'lonDestino': lonDestino,
      },
    );

    if (response is Map && response['data'] is List) {
      return List<Map<String, dynamic>>.from(response['data']);
    }

    return [];
  }
}
