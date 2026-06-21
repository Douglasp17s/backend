import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EtaParamsDto } from './dto';

@Injectable()
export class IaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula ETA (tiempo de llegada estimado) para una línea en ubicación específica
   * Simula un modelo ML entrenado que predice el tiempo basado en:
   * - Hora del día
   * - Condiciones de tráfico
   * - Distancia a parada
   * - Datos históricos
   */
  async calcularEta(dto: EtaParamsDto) {
    // Simular cálculo basado en hora y condiciones
    const ahora = new Date();
    const hora = ahora.getHours();
    const minuto = ahora.getMinutes();

    // Factor de tráfico (más alto en horas pico)
    let factorTrafico = 1.0;
    if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
      factorTrafico = 1.5; // Horas pico
    } else if (hora >= 22 || hora <= 5) {
      factorTrafico = 0.6; // Madrugada, menos tráfico
    }

    // ETA base entre 5-15 minutos
    const etaBase = 8;
    const etaCalculado = Math.round(etaBase * factorTrafico);

    return {
      lineaId: dto.lineaId,
      eta: etaCalculado,
      unidad: 'minutos',
      confianza: 0.85 + Math.random() * 0.1, // 85-95% confianza
      factorTrafico,
      timestamp: ahora,
    };
  }

  /**
   * Predice el tráfico en una ruta específica
   * Retorna nivel de congestión y condiciones
   */
  async predecirTrafico(lineaId: string) {
    const ahora = new Date();
    const hora = ahora.getHours();

    // Simular análisis de tráfico
    let nivelCongestión = 'BAJO';
    let porcentajeCongestión = Math.random() * 30;

    if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
      nivelCongestión = 'ALTO';
      porcentajeCongestión = 60 + Math.random() * 30;
    } else if (hora >= 12 && hora <= 13) {
      nivelCongestión = 'MODERADO';
      porcentajeCongestión = 40 + Math.random() * 20;
    }

    return {
      lineaId,
      nivelCongestión,
      porcentajeCongestión: Math.round(porcentajeCongestión),
      velocidadPromedio: 25 - (porcentajeCongestión / 100) * 15, // 10-25 km/h
      recomendacion: this.obtenerRecomendacion(nivelCongestión),
      timestamp: ahora,
    };
  }

  /**
   * Recomienda el mejor horario para viajar basado en predicciones
   */
  async recomendarHorario(lineaId: string) {
    const ahora = new Date();
    const horaActual = ahora.getHours();

    const horariosOptimos = [
      { hora: 10, razon: 'Fuera de hora pico matutina' },
      { hora: 14, razon: 'Después del almuerzo, tráfico bajo' },
      { hora: 21, razon: 'Noche, tráfico mínimo' },
    ];

    const horarioMejor = horariosOptimos.find((h) => h.hora > horaActual)
      ? horariosOptimos.find((h) => h.hora > horaActual)
      : horariosOptimos[0];

    return {
      lineaId,
      horaActual,
      horarioOptimo: horarioMejor.hora,
      razon: horarioMejor.razon,
      minutosDeEspera:
        horarioMejor.hora > horaActual
          ? (horarioMejor.hora - horaActual) * 60
          : (24 - horaActual + horarioMejor.hora) * 60,
    };
  }

  /**
   * Detecta anomalías en el sistema de transporte
   * (Accidentes, desvíos, paradas cerradas, etc.)
   */
  async detectarAnomalias(lineaId?: string) {
    // Simular detección de anomalías
    const anomalias = [];

    // Random anomalía (5% de probabilidad)
    if (Math.random() < 0.05) {
      anomalias.push({
        tipo: 'DESVIO',
        lineaId: lineaId || 'LINEA_MULTIPLE',
        descripcion: 'Desvío debido a mantenimiento de calle',
        impactoEta: 10,
        duracionEstimada: 60,
      });
    }

    if (Math.random() < 0.02) {
      anomalias.push({
        tipo: 'ACCIDENTE',
        lineaId: lineaId || 'LINEA_MULTIPLE',
        descripcion: 'Accidente vial reportado',
        impactoEta: 25,
        duracionEstimada: 120,
      });
    }

    return {
      anomalias,
      cantidad: anomalias.length,
      timestamp: new Date(),
    };
  }

  /**
   * Obtiene recomendación textual basada en nivel de congestión
   */
  private obtenerRecomendacion(nivel: string): string {
    const recomendaciones: { [key: string]: string } = {
      BAJO: 'Vía despejada, buen momento para viajar',
      MODERADO: 'Tráfico normal, viaja con confianza',
      ALTO: 'Mucho tráfico, considera esperar 15-20 minutos',
    };
    return recomendaciones[nivel] || 'Información no disponible';
  }

  /**
   * Obtiene predicciones agregadas para un línea
   */
  async obtenerPredicciones(lineaId: string, lat: number, lng: number) {
    const [eta, trafico, horario, anomalias] = await Promise.all([
      this.calcularEta({ lineaId, lat, lng }),
      this.predecirTrafico(lineaId),
      this.recomendarHorario(lineaId),
      this.detectarAnomalias(lineaId),
    ]);

    return {
      lineaId,
      ubicacion: { lat, lng },
      eta,
      trafico,
      horario,
      anomalias,
      generadoEn: new Date(),
    };
  }
}
