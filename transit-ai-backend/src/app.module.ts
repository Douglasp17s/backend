/**
 * Módulo Principal de la Aplicación
 *
 * Estructura modular con:
 * - CommonModule: Infraestructura global (filtros, interceptores, pipes)
 * - PrismaModule: Base de datos
 * - Módulos de características (agrupados por dominio)
 *   - Autenticación y usuarios
 *   - Transporte (líneas, rutas, conductores)
 *   - Operaciones (turnos, asignaciones, viajes)
 *   - Finanzas (billetera, pagos)
 *   - Especialistas (IA, planificador)
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ─────────────────────────────────────────────────────────────────────────
// INFRAESTRUCTURA
// ─────────────────────────────────────────────────────────────────────────

import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';

// ─────────────────────────────────────────────────────────────────────────
// MÓDULOS DE CARACTERÍSTICAS (AGRUPADOS POR DOMINIO)
// ─────────────────────────────────────────────────────────────────────────

// Autenticación y gestión de usuarios
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';

// Transporte y líneas
import { SindicatosModule } from './sindicatos/sindicatos.module';
import { LineasModule } from './lineas/lineas.module';
import { RutasModule } from './rutas/rutas.module';
import { ConductoresModule } from './conductores/conductores.module';
import { ParadasModule } from './paradas/paradas.module';

// Operaciones diarias
import { TurnosModule } from './turnos/turnos.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { ViajesModule } from './viajes/viajes.module';
import { DesviosModule } from './desvios/desvios.module';
import { TrasboardosModule } from './trasbordos/trasbordos.module';
import { InternosModule } from './internos/internos.module';

// Finanzas y billetera
import { BilleteraModule } from './billetera/billetera.module';
import { BlockchainModule } from './blockchain/blockchain.module';

// Monitoreo y reportes
import { GrabacionesModule } from './grabaciones/grabaciones.module';
import { IncidentesModule } from './incidentes/incidentes.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

// Funcionalidades especializadas
import { PreferenciasModule } from './preferencias/preferencias.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { PlanificadorModule } from './planificador/planificador.module';
import { IaModule } from './ia/ia.module';

// Auditoría, Reportes y Pruebas
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ReportesModule } from './reportes/reportes.module';
import { LocationTestModule } from './location-test/location-test.module';

@Module({
  imports: [
    // Infraestructura (debe ser primero)
    CommonModule,
    PrismaModule,

    // Autenticación (primer dominio, requerido por otros)
    AuthModule,
    UsuariosModule,

    // Transporte
    SindicatosModule,
    LineasModule,
    RutasModule,
    ConductoresModule,
    ParadasModule,

    // Operaciones
    TurnosModule,
    AsignacionesModule,
    ViajesModule,
    DesviosModule,
    TrasboardosModule,
    InternosModule,

    // Finanzas
    BilleteraModule,
    BlockchainModule,

    // Monitoreo
    GrabacionesModule,
    IncidentesModule,
    NotificacionesModule,

    // Especialistas
    PreferenciasModule,
    FavoritosModule,
    PlanificadorModule,
    IaModule,

    // Auditoría, Reportes y Pruebas
    AuditoriaModule,
    ReportesModule,
    LocationTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
