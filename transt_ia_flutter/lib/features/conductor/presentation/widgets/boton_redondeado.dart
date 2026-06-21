import 'package:flutter/material.dart';
import '../../../../config/tema/colores_volt.dart';

/// Botón redondeado personalizado para conductor
class BotonRedondeado extends StatelessWidget {
  final String texto;
  final VoidCallback onPressed;
  final Color color;
  final Color textoColor;
  final bool isLoading;
  final double altura;
  final double ancho;
  final double borderRadius;
  final TextStyle? estiloTexto;
  final EdgeInsets padding;

  const BotonRedondeado({
    Key? key,
    required this.texto,
    required this.onPressed,
    this.color = ColoresVolt.verde,
    this.textoColor = ColoresVolt.negro,
    this.isLoading = false,
    this.altura = 56,
    this.ancho = double.infinity,
    this.borderRadius = 50,
    this.estiloTexto,
    this.padding = const EdgeInsets.all(0),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: SizedBox(
        height: altura,
        width: ancho,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isLoading ? null : onPressed,
            borderRadius: BorderRadius.circular(borderRadius),
            child: Container(
              decoration: BoxDecoration(
                color: isLoading
                    ? color.withOpacity(0.6)
                    : color,
                borderRadius: BorderRadius.circular(borderRadius),
              ),
              child: Center(
                child: isLoading
                    ? SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(textoColor),
                        ),
                      )
                    : Text(
                        texto,
                        style: estiloTexto ??
                            TextStyle(
                              color: textoColor,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Variante peligrosa (rojo)
class BotonPeligro extends BotonRedondeado {
  const BotonPeligro({
    Key? key,
    required String texto,
    required VoidCallback onPressed,
    bool isLoading = false,
    double altura = 56,
    double ancho = double.infinity,
    EdgeInsets padding = const EdgeInsets.all(0),
  }) : super(
    key: key,
    texto: texto,
    onPressed: onPressed,
    color: ColoresVolt.peligro,
    textoColor: ColoresVolt.blanco,
    isLoading: isLoading,
    altura: altura,
    ancho: ancho,
    padding: padding,
  );
}
