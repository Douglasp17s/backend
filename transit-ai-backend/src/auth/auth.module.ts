import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditoriaModule } from '../auditoria/auditoria.module';

/**
 * Módulo de Autenticación
 * Configura JWT para validación de tokens
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: obtenerSecretoJwt(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRATION || '15m') as StringValue,
      },
    }),
    AuditoriaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}

/**
 * Obtiene el secreto JWT con validación
 * @throws Error si JWT_SECRET no está configurado
 */
function obtenerSecretoJwt(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET no configurada. Define la variable de entorno en .env',
    );
  }
  return secret;
}
