import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/tema/colores_volt.dart';
import '../../servicios/autenticacion_servicio.dart';
import '../../servicios/api_servicio.dart';
import '../../widgets/boton_primario.dart';
import '../../widgets/campo_entrada_texto.dart';

/// Pantalla de login
class LoginPantalla extends StatefulWidget {
  const LoginPantalla({Key? key}) : super(key: key);

  @override
  State<LoginPantalla> createState() => _LoginPantallaState();
}

class _LoginPantallaState extends State<LoginPantalla> {
  final _formKey = GlobalKey<FormState>();
  final _emailControlador = TextEditingController();
  final _passwordControlador = TextEditingController();
  bool _cargando = false;
  String? _mensajeError;

  late AutenticacionServicio _servicioAuth;

  @override
  void initState() {
    super.initState();
    _servicioAuth = AutenticacionServicio(Get.find<ApiServicio>());
    _servicioAuth.inicializar();
  }

  Future<void> _intentarLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _cargando = true;
      _mensajeError = null;
    });

    try {
      final auth = await _servicioAuth.login(
        email: _emailControlador.text,
        password: _passwordControlador.text,
      );

      if (auth.usuario.esConductor) {
        Get.offNamed('/conductor/panel');
      } else {
        Get.offNamed('/pasajero/panel');
      }
    } catch (e) {
      setState(() => _mensajeError = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(height: 40),
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: ColoresVolt.verdeClaro12,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ColoresVolt.verde, width: 1.5),
                ),
                child: Icon(Icons.directions_bus, color: ColoresVolt.verde, size: 32),
              ),
              SizedBox(height: 24),
              Text(
                'Transit AI',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: ColoresVolt.blanco,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Sistema de transporte inteligente',
                style: TextStyle(
                  fontSize: 14,
                  color: ColoresVolt.pizarra,
                ),
              ),
              SizedBox(height: 40),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    CampoEntradaTexto(
                      etiqueta: 'Email',
                      pista: 'tu@email.com',
                      controlador: _emailControlador,
                      tipoEntrada: TextInputType.emailAddress,
                      icono: Icons.email,
                      validador: (valor) {
                        if (valor?.isEmpty ?? true) return 'El email es requerido';
                        if (!valor!.contains('@')) return 'Email inválido';
                        return null;
                      },
                    ),
                    SizedBox(height: 16),
                    CampoEntradaTexto(
                      etiqueta: 'Contraseña',
                      pista: '••••••••',
                      controlador: _passwordControlador,
                      esPassword: true,
                      icono: Icons.lock,
                      validador: (valor) {
                        if (valor?.isEmpty ?? true) return 'La contraseña es requerida';
                        if ((valor?.length ?? 0) < 6) return 'Mínimo 6 caracteres';
                        return null;
                      },
                    ),
                  ],
                ),
              ),
              SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Get.toNamed('/registro-cliente'),
                  child: Text(
                    '¿No tienes cuenta? Regístrate',
                    style: TextStyle(color: ColoresVolt.verde, fontSize: 12),
                  ),
                ),
              ),
              if (_mensajeError != null)
                Container(
                  padding: EdgeInsets.all(12),
                  margin: EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: ColoresVolt.peligroClaro,
                    border: Border.all(color: ColoresVolt.peligro),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _mensajeError!,
                    style: TextStyle(color: ColoresVolt.peligro, fontSize: 12),
                  ),
                )
              else
                SizedBox(height: 16),
              BotonPrimario(
                etiqueta: 'Iniciar Sesión',
                cargando: _cargando,
                onPresionado: _intentarLogin,
              ),
              SizedBox(height: 20),
              Text(
                'Demo: admin@transit.bo / password123',
                textAlign: TextAlign.center,
                style: TextStyle(color: ColoresVolt.pizarra, fontSize: 11),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailControlador.dispose();
    _passwordControlador.dispose();
    super.dispose();
  }
}
