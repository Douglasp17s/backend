import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { IncidentesGateway } from './incidentes.gateway';
import { CrearIncidenteDto } from './dto/crear-incidente.dto';
import { RevisarIncidenteDto } from './dto/revisar-incidente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('incidentes')
export class IncidentesController {
  constructor(
    private readonly incidentesService: IncidentesService,
    private readonly incidentesGateway: IncidentesGateway,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async obtenerTodos(
    @CurrentUser() usuario: any,
    @Query('conductorId') conductorId?: string,
    @Query('estado') estado?: string,
    @Query('viajeId') viajeId?: string,
  ) {
    const sindicatoId = usuario?.syndicateId ?? undefined;
    return await this.incidentesService.obtenerTodos(conductorId, estado, viajeId, sindicatoId);
  }

  @Get('criticos')
  async obtenerCriticos() {
    return await this.incidentesService.obtenerCriticos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.incidentesService.obtenerPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearIncidenteDto, @CurrentUser() usuario: any) {
    // Si no viene conductorId, obtenerlo del usuario autenticado
    if (!dto.conductorId && usuario?.id) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId: BigInt(usuario.id) },
        select: { id: true },
      });
      if (driver) {
        dto.conductorId = Number(driver.id);
      } else {
        throw new BadRequestException('No se encontró conductor asociado al usuario');
      }
    }

    const datos = await this.incidentesService.crear(dto);
    this.incidentesGateway.emitirNuevoIncidente({
      id: datos.id?.toString(),
      tipo: datos.type,
      descripcion: datos.description,
      reportadoEn: datos.reportedAt,
    });
    return datos;
  }

  @Patch(':id/revisar')
  async revisar(@Param('id') id: string, @Body() dto: RevisarIncidenteDto) {
    return await this.incidentesService.revisar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return await this.incidentesService.eliminar(id);
  }
}
