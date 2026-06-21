import 'package:flutter/material.dart';
import '../../config/tema/colores_volt.dart';

/// Panel principal del pasajero
class PanelPasajero extends StatefulWidget {
  const PanelPasajero({Key? key}) : super(key: key);

  @override
  State<PanelPasajero> createState() => _PanelPasajeroState();
}

class _PanelPasajeroState extends State<PanelPasajero> {
  int _indiceNavegacion = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Transit AI - Pasajero'),
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
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Mapa'),
          BottomNavigationBarItem(icon: Icon(Icons.star), label: 'Favoritos'),
          BottomNavigationBarItem(icon: Icon(Icons.wallet_giftcard), label: 'Billetera'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }

  Widget _obtenerPantalla(int indice) {
    switch (indice) {
      case 0:
        return Center(child: Text('Mapa del Pasajero'));
      case 1:
        return Center(child: Text('Rutas Favoritas'));
      case 2:
        return Center(child: Text('Billetera'));
      case 3:
        return Center(child: Text('Perfil'));
      default:
        return Center(child: Text('Pantalla no encontrada'));
    }
  }
}
