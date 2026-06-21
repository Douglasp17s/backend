import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SindicatosModule } from './sindicatos/sindicatos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConductoresModule } from './conductores/conductores.module';
import { LineasModule } from './lineas/lineas.module';
import { RutasModule } from './rutas/rutas.module';
import { GrabacionesModule } from './grabaciones/grabaciones.module';
import { InternosModule } from './internos/internos.module';
import { TurnosModule } from './turnos/turnos.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { ViajesModule } from './viajes/viajes.module';
import { TerminalesModule } from './terminales/terminales.module';
import { IncidentesModule } from './incidentes/incidentes.module';
import { DesviosModule } from './desvios/desvios.module';
import { TrasboardosModule } from './trasbordos/trasbordos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { PreferenciasModule } from './preferencias/preferencias.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { BilleteraModule } from './billetera/billetera.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SindicatosModule,
    UsuariosModule,
    ConductoresModule,
    LineasModule,
    RutasModule,
    GrabacionesModule,
    InternosModule,
    TurnosModule,
    AsignacionesModule,
    ViajesModule,
    TerminalesModule,
    IncidentesModule,
    DesviosModule,
    TrasboardosModule,
    NotificacionesModule,
    PreferenciasModule,
    FavoritosModule,
    BilleteraModule,
    IaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
