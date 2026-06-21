import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

/**
 * UsuariosModule agrupa los componentes para gestionar usuarios del sistema.
 * Exporta UsuariosService para que otros módulos (ej: auth) puedan buscar usuarios.
 */
@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
