export interface TipoPreferencia {
  id: bigint;
  usuarioId: bigint;
  criterioPreferido: string | null;
  maxCaminataMetros: number;
  maxTrasbordos: number;
  patronesAprendidos: any | null;
  actualizadoEn: Date;
}

export interface TipoActualizarPreferencia {
  criterioPreferido?: string;
  maxCaminataMetros?: number;
  maxTrasbordos?: number;
  patronesAprendidos?: any;
}
