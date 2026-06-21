import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosReportesDto } from './dto/filtros-reportes.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene reportes consolidados de un sindicato
   */
  async obtenerReporte(sindicateId: string, filtros: FiltrosReportesDto) {
    const desde = filtros.desde ? new Date(filtros.desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hasta = filtros.hasta ? new Date(filtros.hasta) : new Date();

    const where: any = {
      syndicateId: BigInt(sindicateId),
      date: { gte: desde, lte: hasta },
    };

    // Obtener asignaciones diarias
    const asignaciones = await this.prisma.dailyAssignment.findMany({
      where,
      include: {
        driver: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        internal: { select: { internalNumber: true, licensePlate: true } },
        route: { select: { name: true } },
      },
    });

    // Obtener transferencias
    const transferencias = await this.prisma.internalTransfer.findMany({
      where: {
        suggestedAt: { gte: desde, lte: hasta },
      },
      include: {
        decidedBy: { select: { id: true, name: true } },
        originTrip: { include: { assignment: { include: { internal: { select: { internalNumber: true } } } } } },
        destinationTrip: { include: { assignment: { include: { internal: { select: { internalNumber: true } } } } } },
      },
    });

    // Obtener viajes
    const viajes = await this.prisma.trip.findMany({
      where: {
        assignment: {
          syndicateId: BigInt(sindicateId),
          date: { gte: desde, lte: hasta },
        },
      },
      include: {
        assignment: {
          include: {
            internal: { select: { internalNumber: true } },
            driver: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    // Calcular métricas
    const totalAsignaciones = asignaciones.length;
    const totalVueltas = asignaciones.reduce((sum, a) => sum + (a.actualRounds || 0), 0);
    const totalTransferencias = transferencias.length;
    const totalViajes = viajes.length;

    // Agrupar por conductor
    const reportePorConductor = asignaciones.reduce((acc, asignacion) => {
      const conductorKey = asignacion.driver?.user?.name || 'Sin conductor';
      if (!acc[conductorKey]) {
        acc[conductorKey] = {
          nombre: conductorKey,
          email: asignacion.driver?.user?.email,
          totalAsignaciones: 0,
          totalVueltas: 0,
          totalViajes: 0,
          promedioVueltas: 0,
        };
      }
      acc[conductorKey].totalAsignaciones += 1;
      acc[conductorKey].totalVueltas += asignacion.actualRounds || 0;
      acc[conductorKey].totalViajes += viajes.filter((v) => v.assignmentId === asignacion.id).length;
      return acc;
    }, {} as Record<string, any>);

    // Calcular promedios
    Object.values(reportePorConductor).forEach((conductor: any) => {
      conductor.promedioVueltas = conductor.totalAsignaciones > 0 ? (conductor.totalVueltas / conductor.totalAsignaciones).toFixed(2) : 0;
    });

    return {
      periodo: { desde, hasta },
      resumen: {
        totalAsignaciones,
        totalVueltas,
        totalTransferencias,
        totalViajes,
        promedioVueltasPorAsignacion: totalAsignaciones > 0 ? (totalVueltas / totalAsignaciones).toFixed(2) : 0,
      },
      reportePorConductor: Object.values(reportePorConductor),
      asignacionesDetalladas: asignaciones.map((a) => ({
        id: a.id,
        fecha: a.date,
        conductor: a.driver?.user?.name || 'Sin conductor',
        micro: a.internal?.internalNumber,
        ruta: a.route?.name,
        vueltas: a.actualRounds,
        horaInicio: a.startTime,
        horaFin: a.endTime,
      })),
      transferenciasDetalladas: transferencias.map((t) => ({
        id: t.id,
        fecha: t.suggestedAt,
        viajeorigen: t.originTrip?.assignment?.internal?.internalNumber,
        viajedestino: t.destinationTrip?.assignment?.internal?.internalNumber,
        estado: t.status,
      })),
    };
  }

  /**
   * Exporta reporte a PDF (retorna datos para PDF)
   */
  async exportarPDF(sindicateId: string, filtros: FiltrosReportesDto) {
    const reporte = await this.obtenerReporte(sindicateId, filtros);

    // Los datos ya están en formato exportable
    return {
      ...reporte,
      formato: 'PDF',
      generadoEn: new Date().toISOString(),
    };
  }

  /**
   * Obtiene estadísticas diarias
   */
  async obtenerEstadisticasDiarias(sindicateId: string, fecha: string) {
    const diaInicio = new Date(fecha);
    const diaFin = new Date(fecha);
    diaFin.setDate(diaFin.getDate() + 1);

    const asignaciones = await this.prisma.dailyAssignment.findMany({
      where: {
        syndicateId: BigInt(sindicateId),
        date: { gte: diaInicio, lt: diaFin },
      },
      include: {
        internal: { select: { internalNumber: true } },
        driver: { include: { user: { select: { name: true } } } },
      },
    });

    const estadisticas = {
      fecha,
      totalBuses: asignaciones.length,
      totalVueltas: asignaciones.reduce((sum, a) => sum + (a.actualRounds || 0), 0),
      asignacionesDetalle: asignaciones.map((a) => ({
        micro: a.internal?.internalNumber,
        conductor: a.driver?.user?.name,
        vueltas: a.actualRounds,
      })),
    };

    return estadisticas;
  }
}
