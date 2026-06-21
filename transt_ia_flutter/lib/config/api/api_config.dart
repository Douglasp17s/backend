import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String baseUrl = 'http://localhost:4000';
  static const String apiVersion = '/api/v1';
  static const Duration timeout = Duration(seconds: 30);

  static late Dio _dio;

  static Future<void> init() async {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: timeout,
        receiveTimeout: timeout,
        contentType: 'application/json',
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _onRequest,
        onResponse: _onResponse,
        onError: _onError,
      ),
    );
  }

  static Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    return handler.next(options);
  }

  static Future<void> _onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) async {
    return handler.next(response);
  }

  static Future<void> _onError(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    if (error.response?.statusCode == 401) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
    }

    return handler.next(error);
  }

  static Dio get dio => _dio;
}
