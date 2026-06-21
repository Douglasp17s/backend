import { Injectable } from '@nestjs/common';

// El modelo Stop/RouteStop fue eliminado del schema.
// Las paradas ahora se gestionan como Terminal + LineTerminal.
// Ver: /terminales y /terminales/:id
@Injectable()
export class ParadasService {
  obtenerMensaje() {
    return {
      mensaje: 'El módulo de paradas fue migrado a /terminales. Usa GET /terminales para listar paradas/terminales.',
    };
  }
}
