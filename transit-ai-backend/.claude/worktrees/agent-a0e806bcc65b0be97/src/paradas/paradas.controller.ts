import { Controller, Get } from '@nestjs/common';
import { ParadasService } from './paradas.service';

@Controller('paradas')
export class ParadasController {
  constructor(private readonly paradasService: ParadasService) {}

  @Get()
  info() {
    return this.paradasService.obtenerMensaje();
  }
}
