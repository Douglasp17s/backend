import 'package:get/get.dart';
import '../../../../models/linea.dart';
import '../../../../services/api_service.dart';

class RutasController extends GetxController {
  final lineas = <Linea>[].obs;
  final lineasFavoritas = <String>[].obs;
  final cargando = false.obs;
  final error = Rxn<String>();
  final busqueda = ''.obs;

  @override
  void onInit() {
    super.onInit();
    cargarLineas();
    cargarFavoritas();
  }

  Future<void> cargarLineas() async {
    try {
      cargando.value = true;
      error.value = null;

      lineas.value = await ApiService.obtenerLista<List<Linea>>(
        '/lineas',
        fromJsonList: (data) {
          return (data as List)
              .map((item) => Linea.fromJson(item as Map<String, dynamic>))
              .toList();
        },
      );
    } catch (e) {
      error.value = 'Error al cargar lineas: ${e.toString()}';
    } finally {
      cargando.value = false;
    }
  }

  Future<void> cargarFavoritas() async {
    try {
      lineasFavoritas.value = await ApiService.obtenerLista<List<String>>(
        '/pasajero/favoritas',
        fromJsonList: (data) {
          return (data as List)
              .map((item) => item.toString())
              .toList();
        },
      );
    } catch (e) {
      error.value = 'Error al cargar favoritas: ${e.toString()}';
    }
  }

  Future<void> agregarFavorita(String lineaId) async {
    try {
      await ApiService.crear(
        '/pasajero/favoritas',
        {'lineaId': lineaId},
        fromJson: (data) => data,
      );

      if (!lineasFavoritas.contains(lineaId)) {
        lineasFavoritas.add(lineaId);
      }
    } catch (e) {
      error.value = 'Error al agregar favorita: ${e.toString()}';
    }
  }

  Future<void> eliminarFavorita(String lineaId) async {
    try {
      await ApiService.eliminar('/pasajero/favoritas/$lineaId');
      lineasFavoritas.removeWhere((id) => id == lineaId);
    } catch (e) {
      error.value = 'Error al eliminar favorita: ${e.toString()}';
    }
  }

  List<Linea> get lineasFiltradas {
    if (busqueda.value.isEmpty) {
      return lineas;
    }

    final termino = busqueda.value.toLowerCase();
    return lineas
        .where((linea) =>
            linea.numero.toLowerCase().contains(termino) ||
            linea.nombre.toLowerCase().contains(termino) ||
            linea.origen.toLowerCase().contains(termino) ||
            linea.destino.toLowerCase().contains(termino))
        .toList();
  }

  bool esFavorita(String lineaId) {
    return lineasFavoritas.contains(lineaId);
  }

  void actualizarBusqueda(String termino) {
    busqueda.value = termino;
  }
}
