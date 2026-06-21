import 'package:flutter/material.dart';
import '../config/tema/colores_volt.dart';

/// Campo de entrada de texto reutilizable
class CampoEntradaTexto extends StatefulWidget {
  final String etiqueta;
  final String? pista;
  final TextEditingController? controlador;
  final TextInputType tipoEntrada;
  final bool esPassword;
  final IconData? icono;
  final String? Function(String?)? validador;
  final int? lineasMaximas;

  const CampoEntradaTexto({
    Key? key,
    required this.etiqueta,
    this.pista,
    this.controlador,
    this.tipoEntrada = TextInputType.text,
    this.esPassword = false,
    this.icono,
    this.validador,
    this.lineasMaximas,
  }) : super(key: key);

  @override
  State<CampoEntradaTexto> createState() => _CampoEntradaTextoState();
}

class _CampoEntradaTextoState extends State<CampoEntradaTexto> {
  late bool _mostrarPassword;

  @override
  void initState() {
    super.initState();
    _mostrarPassword = false;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.etiqueta,
          style: TextStyle(
            color: ColoresVolt.pergamino,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 8),
        TextFormField(
          controller: widget.controlador,
          keyboardType: widget.tipoEntrada,
          obscureText: widget.esPassword && !_mostrarPassword,
          maxLines: widget.lineasMaximas == null ? 1 : null,
          minLines: widget.lineasMaximas,
          validator: widget.validador,
          decoration: InputDecoration(
            hintText: widget.pista,
            prefixIcon: widget.icono != null
              ? Icon(widget.icono, color: ColoresVolt.pizarra)
              : null,
            suffixIcon: widget.esPassword
              ? IconButton(
                  icon: Icon(
                    _mostrarPassword ? Icons.visibility : Icons.visibility_off,
                    color: ColoresVolt.pizarra,
                  ),
                  onPressed: () {
                    setState(() => _mostrarPassword = !_mostrarPassword);
                  },
                )
              : null,
          ),
          style: TextStyle(color: ColoresVolt.blanco),
        ),
      ],
    );
  }
}
