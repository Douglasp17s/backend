import 'package:dio/dio.dart';
import '../config/api/api_config.dart';

class ApiService {
  static Future<T> obtener<T>(
    String endpoint, {
    required T Function(dynamic) fromJson,
  }) async {
    try {
      final response = await ApiConfig.dio.get(endpoint);

      if (response.statusCode == 200) {
        return fromJson(response.data['data'] ?? response.data);
      }

      throw Exception('Error en GET $endpoint: ${response.statusCode}');
    } on DioException catch (e) {
      throw Exception('Error en GET $endpoint: ${e.message}');
    }
  }

  static Future<T> obtenerLista<T>(
    String endpoint, {
    required T Function(List<dynamic>) fromJsonList,
  }) async {
    try {
      final response = await ApiConfig.dio.get(endpoint);

      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return fromJsonList(data is List ? data : []);
      }

      throw Exception('Error en GET $endpoint: ${response.statusCode}');
    } on DioException catch (e) {
      throw Exception('Error en GET $endpoint: ${e.message}');
    }
  }

  static Future<T> crear<T>(
    String endpoint,
    Map<String, dynamic> data, {
    required T Function(dynamic) fromJson,
  }) async {
    try {
      final response = await ApiConfig.dio.post(endpoint, data: data);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return fromJson(response.data['data'] ?? response.data);
      }

      throw Exception('Error en POST $endpoint: ${response.statusCode}');
    } on DioException catch (e) {
      throw Exception('Error en POST $endpoint: ${e.message}');
    }
  }

  static Future<T> actualizar<T>(
    String endpoint,
    Map<String, dynamic> data, {
    required T Function(dynamic) fromJson,
  }) async {
    try {
      final response = await ApiConfig.dio.patch(endpoint, data: data);

      if (response.statusCode == 200) {
        return fromJson(response.data['data'] ?? response.data);
      }

      throw Exception('Error en PATCH $endpoint: ${response.statusCode}');
    } on DioException catch (e) {
      throw Exception('Error en PATCH $endpoint: ${e.message}');
    }
  }

  static Future<void> eliminar(String endpoint) async {
    try {
      final response = await ApiConfig.dio.delete(endpoint);

      if (response.statusCode != 200) {
        throw Exception('Error en DELETE $endpoint: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Error en DELETE $endpoint: ${e.message}');
    }
  }

  static Future<dynamic> custom(
    String method,
    String endpoint, {
    Map<String, dynamic>? data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await ApiConfig.dio.request(
        endpoint,
        options: Options(method: method),
        data: data,
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data;
      }

      throw Exception('Error en $method $endpoint: ${response.statusCode}');
    } on DioException catch (e) {
      throw Exception('Error en $method $endpoint: ${e.message}');
    }
  }
}
