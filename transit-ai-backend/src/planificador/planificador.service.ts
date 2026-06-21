import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IaService } from '../ia/ia.service';

// ─── Constantes ───────────────────────────────────────────────────────────────
const RADIO_BUSQUEDA_M = 600; // metros: radio para considerar que una línea "sirve" un punto
const RADIO_TRASBORDO_M = 400; // metros: radio para encontrar punto de transferencia
const VELOCIDAD_BUS_MPM = 416.67; // m/min → 25 km/h
const VELOCIDAD_CAMINATA_MPM = 83.33; // m/min → 5 km/h
const PASOS_INTERPOLACION = 30; // puntos intermedios al sintetizar ruta entre terminales
const MAX_OPCIONES = 3;

// ─── Tipos internos ───────────────────────────────────────────────────────────
type Coord = [number, number]; // [lat, lng]

export interface LineaConPuntos {
  id: string;
  nombre: string;
  codigo: string;
  color: string;
  imageUrl: string | null;
  tarifa: number;
  descripcion: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  distanciaKm: number;
  tiempoEstimadoMin: number;
  puntos: Coord[];
}

interface AccesoLinea {
  linea: LineaConPuntos;
  idxOrigen: number;
  distOrigen: number;
  idxDestino: number;
  distDestino: number;
}

export interface SegmentoBus {
  tipo: 'bus';
  linea: {
    id: string;
    nombre: string;
    codigo: string;
    color: string;
    imageUrl: string | null;
    tarifa: number;
  };
  embarque: { lat: number; lng: number };
  descenso: { lat: number; lng: number };
  puntosRuta: Coord[];
  distanciaKm: number;
  tiempoMin: number;
}

export interface SegmentoCaminata {
  tipo: 'caminata';
  desde: { lat: number; lng: number };
  hasta: { lat: number; lng: number };
  puntosRuta: Coord[];
  distanciaMetros: number;
  tiempoMin: number;
}

export type Segmento = SegmentoBus | SegmentoCaminata;

export interface OpcionRuta {
  segmentos: Segmento[];
  tiempoTotalMin: number;
  tiempoEsperaMin: number;
  distanciaTotalKm: number;
  caminataMetros: number;
  transbordos: number;
  costoTotal: number;
}

// ─── Helpers geoespaciales ────────────────────────────────────────────────────
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function puntoMasCercano(
  puntos: Coord[],
  lat: number,
  lng: number,
): { idx: number; dist: number } {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < puntos.length; i++) {
    const d = haversine(puntos[i][0], puntos[i][1], lat, lng);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  }
  return { idx: minIdx, dist: minDist };
}

function distanciaRuta(puntos: Coord[]): number {
  let d = 0;
  for (let i = 1; i < puntos.length; i++)
    d += haversine(
      puntos[i - 1][0],
      puntos[i - 1][1],
      puntos[i][0],
      puntos[i][1],
    );
  return d / 1000; // km
}

/** Interpola N puntos entre origen y destino con ligera curva (determinística) */
function interpolarRuta(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number,
  pasos = PASOS_INTERPOLACION,
): Coord[] {
  const pts: Coord[] = [];
  // Curva determinística basada en la distancia (sin Math.random)
  const desvLat = (latB - latA) * 0.08;
  const desvLng = -(lngB - lngA) * 0.08;
  const midLat = (latA + latB) / 2 + desvLat;
  const midLng = (lngA + lngB) / 2 + desvLng;
  const mitad = Math.floor(pasos / 2);
  for (let i = 0; i <= mitad; i++) {
    const t = i / mitad;
    pts.push([latA + (midLat - latA) * t, lngA + (midLng - lngA) * t]);
  }
  for (let i = 1; i <= mitad; i++) {
    const t = i / mitad;
    pts.push([midLat + (latB - midLat) * t, midLng + (lngB - midLng) * t]);
  }
  return pts;
}

/** Parsea recordedPoints (JSON almacenado en Prisma) a array de [lat, lng] */
function parsePuntos(rp: any): Coord[] {
  if (!rp) return [];
  try {
    const data = typeof rp === 'string' ? JSON.parse(rp) : rp;
    // GeoJSON LineString: { type: "LineString", coordinates: [[lng, lat], ...] }
    if (data?.type === 'LineString' && Array.isArray(data.coordinates)) {
      return data.coordinates.map(
        ([lng, lat]: number[]) => [lat, lng] as Coord,
      );
    }
    // GeoJSON FeatureCollection
    if (data?.type === 'FeatureCollection') {
      const coords: Coord[] = [];
      for (const f of data.features ?? []) {
        if (f.geometry?.type === 'LineString')
          coords.push(...f.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng] as Coord));
      }
      return coords;
    }
    // Array of [lat, lng]
    if (Array.isArray(data) && data.length > 0) {
      if (Array.isArray(data[0])) return data as Coord[];
      if (typeof data[0] === 'object' && 'lat' in data[0])
        return data.map((p: any) => [Number(p.lat), Number(p.lng)] as Coord);
    }
  } catch {}
  return [];
}

/** Extrae el segmento de ruta correcto entre dos índices, respetando circularidad */
function extraerSegmento(puntos: Coord[], desde: number, hasta: number): Coord[] {
  if (desde <= hasta) return puntos.slice(desde, hasta + 1);
  return [...puntos.slice(desde), ...puntos.slice(0, hasta + 1)];
}

/** Crea un segmento de caminata con línea recta entre los dos puntos */
function mkCaminata(
  desdeLat: number, desdeLng: number,
  hastaLat: number, hastaLng: number,
  dist: number,
): SegmentoCaminata {
  const pts: Coord[] = [];
  const N = 6;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([
      desdeLat + (hastaLat - desdeLat) * t,
      desdeLng + (hastaLng - desdeLng) * t,
    ]);
  }
  return {
    tipo: 'caminata',
    desde: { lat: desdeLat, lng: desdeLng },
    hasta: { lat: hastaLat, lng: hastaLng },
    puntosRuta: pts,
    distanciaMetros: Math.round(dist),
    tiempoMin: Math.ceil(dist / VELOCIDAD_CAMINATA_MPM),
  };
}

@Injectable()
export class PlanificadorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly iaService: IaService,
  ) {}

  async obtenerLineasParaMapa(): Promise<LineaConPuntos[]> {
    try {
      return await this.obtenerLineasConPuntos();
    } catch (e) {
      console.error('[PlanificadorService] Error obteniendo líneas:', e);
      return [];
    }
  }

  // ─── Construye el mapa de líneas con sus puntos de ruta ─────────────────────
  private async obtenerLineasConPuntos(): Promise<LineaConPuntos[]> {
    const lineas = await this.prisma.busLine.findMany({
      where: { active: true, deletedAt: null },
      include: {
        routes: {
          where: { active: true, deletedAt: null },
          include: { routeRecording: true },
          take: 2,
        },
      },
    });

    const resultado: LineaConPuntos[] = [];

    for (const linea of lineas) {
      let puntos: Coord[] = [];

      // 1. Intentar desde route recordings asociados
      if (puntos.length === 0) {
        for (const ruta of linea.routes) {
          if (ruta.routeRecording) {
            const pts = parsePuntos(ruta.routeRecording.recordedPoints);
            if (pts.length > puntos.length) puntos = pts;
          }
        }
      }

      // 5. Fallback sintético: ruta determinística dentro de Santa Cruz
      if (puntos.length === 0) {
        const idHash = Number(linea.id % BigInt(360));
        const angulo = (idHash / 360) * Math.PI * 2;
        const radio = 0.025 + (idHash % 30) * 0.001;
        puntos = interpolarRuta(
          -17.7833 + Math.cos(angulo) * radio,
          -63.1821 + Math.sin(angulo) * radio * 1.5,
          -17.7833 + Math.cos(angulo + Math.PI) * radio,
          -63.1821 + Math.sin(angulo + Math.PI) * radio * 1.5,
        );
      }

      const distKm = Math.round(distanciaRuta(puntos) * 10) / 10;
      const tiempoMin = Math.round((distKm * 1000) / VELOCIDAD_BUS_MPM);

      const formatHora = (d: Date | null) =>
        d ? d.toISOString().slice(11, 16) : null;

      resultado.push({
        id: linea.id.toString(),
        nombre: linea.name,
        codigo: linea.code,
        color: linea.color,
        imageUrl: linea.imageUrl,
        tarifa: Number(linea.fare),
        descripcion: linea.description,
        horaInicio: formatHora(linea.operationStartTime),
        horaFin: formatHora(linea.operationEndTime),
        distanciaKm: distKm,
        tiempoEstimadoMin: tiempoMin,
        puntos,
      });
    }

    return resultado;
  }

  // ─── Estima tiempo de espera basado en buses activos ─────────────────────────
  private async estimarTiempoEspera(lineaId: string, embarqueLat: number, embarqueLng: number): Promise<number> {
    // Nota: ETA detallada ahora se calcula en Django ML Service
    // Aquí usamos estimación local rápida
    const busesActivos = await this.prisma.trip.count({
      where: {
        assignment: { route: { lineId: BigInt(lineaId) } },
        status: 'IN_PROGRESS',
      },
    });

    // Tiempo de espera: 5 min base + 2 min por cada bus menos 1 disponible
    return Math.max(3, 5 + Math.max(0, 2 - busesActivos));
  }

  // ─── Algoritmo principal ─────────────────────────────────────────────────────
  async calcularRuta(
    origenLat: number, origenLng: number,
    destinoLat: number, destinoLng: number,
  ): Promise<OpcionRuta[]> {

    const lineas = await this.obtenerLineasConPuntos();
    const opciones: OpcionRuta[] = [];

    // Para cada línea, calcular accesibilidad desde origen y destino
    const accesos: AccesoLinea[] = lineas.map((linea) => {
      const { idx: idxO, dist: distO } = puntoMasCercano(linea.puntos, origenLat, origenLng);
      const { idx: idxD, dist: distD } = puntoMasCercano(linea.puntos, destinoLat, destinoLng);
      return { linea, idxOrigen: idxO, distOrigen: distO, idxDestino: idxD, distDestino: distD };
    });

    const lineasOrigen = accesos.filter((a) => a.distOrigen <= RADIO_BUSQUEDA_M);
    const lineasDestino = accesos.filter((a) => a.distDestino <= RADIO_BUSQUEDA_M);

    // ── RUTAS DIRECTAS (una sola línea) ──────────────────────────────────────
    for (const acc of accesos) {
      if (acc.distOrigen > RADIO_BUSQUEDA_M || acc.distDestino > RADIO_BUSQUEDA_M) continue;

      const { linea, idxOrigen, idxDestino, distOrigen, distDestino } = acc;
      const segPuntos = extraerSegmento(linea.puntos, idxOrigen, idxDestino);

      // Si el segmento tiene solo 1 punto, no es útil
      if (segPuntos.length < 2) continue;

      const distBus = distanciaRuta(segPuntos);
      const tiempoBus = Math.ceil((distBus * 1000) / VELOCIDAD_BUS_MPM);

      const segs: Segmento[] = [];
      let caminataTotal = 0;

      if (distOrigen > 50) {
        caminataTotal += distOrigen;
        segs.push(
          mkCaminata(
            origenLat,
            origenLng,
            linea.puntos[idxOrigen][0],
            linea.puntos[idxOrigen][1],
            distOrigen,
          ),
        );
      }

      segs.push({
        tipo: 'bus',
        linea: { id: linea.id, nombre: linea.nombre, codigo: linea.codigo, color: linea.color, imageUrl: linea.imageUrl, tarifa: linea.tarifa },
        embarque: { lat: linea.puntos[idxOrigen][0], lng: linea.puntos[idxOrigen][1] },
        descenso: { lat: linea.puntos[idxDestino][0], lng: linea.puntos[idxDestino][1] },
        puntosRuta: segPuntos,
        distanciaKm: Math.round(distBus * 100) / 100,
        tiempoMin: tiempoBus,
      });

      if (distDestino > 50) {
        caminataTotal += distDestino;
        segs.push(
          mkCaminata(
            linea.puntos[idxDestino][0],
            linea.puntos[idxDestino][1],
            destinoLat,
            destinoLng,
            distDestino,
          ),
        );
      }

      const tiempoViaje = segs.reduce((s, seg) => s + seg.tiempoMin, 0);
      const espera = await this.estimarTiempoEspera(
        linea.id, linea.puntos[idxOrigen][0], linea.puntos[idxOrigen][1],
      );
      const costo = linea.tarifa;
      opciones.push({
        segmentos: segs,
        tiempoTotalMin: tiempoViaje + espera,
        tiempoEsperaMin: espera,
        distanciaTotalKm: Math.round(distBus * 100) / 100,
        caminataMetros: Math.round(caminataTotal),
        transbordos: 0,
        costoTotal: costo,
      });
    }

    // ── RUTAS CON TRASBORDO (si hay pocas opciones directas) ─────────────────
    if (opciones.length < MAX_OPCIONES) {
      outer:
      for (const accO of lineasOrigen) {
        for (const accD of lineasDestino) {
          if (accO.linea.id === accD.linea.id) continue;
          if (opciones.length >= MAX_OPCIONES) break outer;

          const { linea: l1, idxOrigen: i1O } = accO;
          const { linea: l2, idxDestino: i2D } = accD;

          // Buscar punto de trasbordo: punto en l1 más cercano a l2
          let mejorTransbordo: { idxL1: number; idxL2: number; dist: number } | null = null;

          // Muestrear cada 3 puntos para eficiencia
          for (let i = i1O; i < l1.puntos.length; i += 3) {
            const { idx: idxL2, dist } = puntoMasCercano(l2.puntos, l1.puntos[i][0], l1.puntos[i][1]);
            if (dist < RADIO_TRASBORDO_M) {
              // Verificar que idxL2 <= i2D (dirección correcta en l2)
              if (idxL2 <= i2D) {
                if (!mejorTransbordo || dist < mejorTransbordo.dist) {
                  mejorTransbordo = { idxL1: i, idxL2, dist };
                }
              }
            }
          }

          if (!mejorTransbordo) continue;

          const { idxL1, idxL2, dist: distTransbordo } = mejorTransbordo;

          const seg1Puntos = extraerSegmento(l1.puntos, i1O, idxL1);
          const seg2Puntos = extraerSegmento(l2.puntos, idxL2, i2D);
          if (seg1Puntos.length < 2 || seg2Puntos.length < 2) continue;

          const dist1 = distanciaRuta(seg1Puntos);
          const dist2 = distanciaRuta(seg2Puntos);
          const tiempo1 = Math.ceil((dist1 * 1000) / VELOCIDAD_BUS_MPM);
          const tiempo2 = Math.ceil((dist2 * 1000) / VELOCIDAD_BUS_MPM);

          const segs: Segmento[] = [];
          let caminataTotal = 0;

          if (accO.distOrigen > 50) {
            caminataTotal += accO.distOrigen;
            segs.push(
              mkCaminata(
                origenLat,
                origenLng,
                l1.puntos[i1O][0],
                l1.puntos[i1O][1],
                accO.distOrigen,
              ),
            );
          }

          segs.push({
            tipo: 'bus',
            linea: { id: l1.id, nombre: l1.nombre, codigo: l1.codigo, color: l1.color, imageUrl: l1.imageUrl, tarifa: l1.tarifa },
            embarque: { lat: l1.puntos[i1O][0], lng: l1.puntos[i1O][1] },
            descenso: { lat: l1.puntos[idxL1][0], lng: l1.puntos[idxL1][1] },
            puntosRuta: seg1Puntos,
            distanciaKm: Math.round(dist1 * 100) / 100,
            tiempoMin: tiempo1,
          });

          if (distTransbordo > 30) {
            caminataTotal += distTransbordo;
            segs.push(
              mkCaminata(
                l1.puntos[idxL1][0],
                l1.puntos[idxL1][1],
                l2.puntos[idxL2][0],
                l2.puntos[idxL2][1],
                distTransbordo,
              ),
            );
          }

          segs.push({
            tipo: 'bus',
            linea: { id: l2.id, nombre: l2.nombre, codigo: l2.codigo, color: l2.color, imageUrl: l2.imageUrl, tarifa: l2.tarifa },
            embarque: { lat: l2.puntos[idxL2][0], lng: l2.puntos[idxL2][1] },
            descenso: { lat: l2.puntos[i2D][0], lng: l2.puntos[i2D][1] },
            puntosRuta: seg2Puntos,
            distanciaKm: Math.round(dist2 * 100) / 100,
            tiempoMin: tiempo2,
          });

          if (accD.distDestino > 50) {
            caminataTotal += accD.distDestino;
            segs.push(
              mkCaminata(
                l2.puntos[i2D][0],
                l2.puntos[i2D][1],
                destinoLat,
                destinoLng,
                accD.distDestino,
              ),
            );
          }

          const tiempoViaje2 = segs.reduce((s, seg) => s + seg.tiempoMin, 0);
          const espera2 = await this.estimarTiempoEspera(
            l1.id, l1.puntos[i1O][0], l1.puntos[i1O][1],
          );
          const costo2 = l1.tarifa + l2.tarifa;
          opciones.push({
            segmentos: segs,
            tiempoTotalMin: tiempoViaje2 + espera2,
            tiempoEsperaMin: espera2,
            distanciaTotalKm: Math.round((dist1 + dist2) * 100) / 100,
            caminataMetros: Math.round(caminataTotal),
            transbordos: 1,
            costoTotal: costo2,
          });
        }
      }
    }

    // ── Sin opciones: ruta en taxi/walking completa ───────────────────────────
    if (opciones.length === 0) {
      const distTotal = haversine(origenLat, origenLng, destinoLat, destinoLng);
      opciones.push({
        segmentos: [mkCaminata(origenLat, origenLng, destinoLat, destinoLng, distTotal)],
        tiempoTotalMin: Math.ceil(distTotal / VELOCIDAD_CAMINATA_MPM),
        tiempoEsperaMin: 0,
        distanciaTotalKm: Math.round(distTotal / 10) / 100,
        caminataMetros: Math.round(distTotal),
        transbordos: 0,
        costoTotal: 0,
      });
    }

    return opciones
      .sort((a, b) => a.tiempoTotalMin - b.tiempoTotalMin)
      .slice(0, MAX_OPCIONES);
  }
}
