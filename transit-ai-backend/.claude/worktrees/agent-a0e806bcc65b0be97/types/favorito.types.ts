export interface TipoFavorito {
  id: bigint;
  usuarioId: bigint;
  alias: string;
  latitudOrigen: string;
  longitudOrigen: string;
  etiquetaOrigen: string;
  latitudDestino: string;
  longitudDestino: string;
  etiquetaDestino: string;
  ultimoResultado: any | null;
  ultimoCalculoEn: Date | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoCrearFavorito {
  usuarioId: number;
  alias: string;
  latitudOrigen: number;
  longitudOrigen: number;
  etiquetaOrigen: string;
  latitudDestino: number;
  longitudDestino: number;
  etiquetaDestino: string;
}

export interface TipoActualizarFavorito {
  alias?: string;
  latitudOrigen?: number;
  longitudOrigen?: number;
  etiquetaOrigen?: string;
  latitudDestino?: number;
  longitudDestino?: number;
  etiquetaDestino?: string;
  activo?: boolean;
}
