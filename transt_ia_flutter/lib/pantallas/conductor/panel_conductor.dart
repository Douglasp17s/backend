import 'package:flutter/material.dart';
import '../../config/tema/colores_volt.dart';

/// Panel principal del conductor
class PanelConductor extends StatefulWidget {
  const PanelConductor({Key? key}) : super(key: key);

  @override
  State<PanelConductor> createState() => _PanelConductorState();
}

class _PanelConductorState extends State<PanelConductor> {
  int _indiceNavegacion = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Transit AI - Conductor'),
        centerTitle: true,
      ),
      body: _obtenerPantalla(_indiceNavegacion),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _indiceNavegacion,
        onTap: (indice) => setState(() => _indiceNavegacion = indice),
        backgroundColor: ColoresVolt.negro,
        selectedItemColor: ColoresVolt.verde,
        unselectedItemColor: ColoresVolt.pizarra,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.local_shipping), label: 'Iniciar Viaje'),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Mapa'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code), label: 'Escanear'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }

  Widget _obtenerPantalla(int indice) {
    switch (indice) {
      case 0:
        return Center(child: Text('Iniciar Viaje'));
      case 1:
        return Center(child: Text('Mapa del Conductor'));
      case 2:
        return Center(child: Text('Escanear QR'));
      case 3:
        return Center(child: Text('Perfil Conductor'));
      default:
        return Center(child: Text('Pantalla no encontrada'));
    }
  }
}
