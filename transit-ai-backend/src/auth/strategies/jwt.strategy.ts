import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Estrategia JWT para Passport
 * Valida tokens JWT en requests autenticados
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: obtenerSecretoJwtStrategy(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { id: BigInt(payload.sub), deletedAt: null, active: true },
      select: { id: true, email: true, role: true, name: true, syndicateId: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      syndicateId: user.syndicateId?.toString() ?? null,
    };
  }
}

/**
 * Obtiene el secreto JWT con validación
 * Se ejecuta al iniciar el módulo
 * @throws Error si JWT_SECRET no está configurado
 */
function obtenerSecretoJwtStrategy(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET no configurada. Define la variable de entorno en .env',
    );
  }
  return secret;
}
