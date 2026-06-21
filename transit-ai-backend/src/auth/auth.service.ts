import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.nombre,
        passwordHash,
        phone: dto.telefono,
        role: dto.rol ?? 'PASSENGER',
      },
    });

    const tokens = await this.generarTokens(user.id.toString(), user.email, user.role);
    return {
      usuario: { id: user.id.toString(), nombre: user.name, email: user.email, rol: user.role },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.passwordHash) throw new UnauthorizedException('Credenciales inválidas');

    const valida = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valida) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.active) throw new UnauthorizedException('Cuenta inactiva');

    const tokens = await this.generarTokens(user.id.toString(), user.email, user.role);
    return {
      usuario: { id: user.id.toString(), nombre: user.name, email: user.email, rol: user.role },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generarTokens(stored.user.id.toString(), stored.user.email, stored.user.role);
  }

  async googleLogin(idToken: string) {
    // Verifica el token con Google sin dependencias externas
    const resp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );
    if (!resp.ok) throw new UnauthorizedException('Token de Google inválido');

    const info = (await resp.json()) as {
      sub: string;
      email: string;
      name: string;
      picture: string;
      aud: string;
    };

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && info.aud !== clientId) {
      throw new UnauthorizedException('Token no pertenece a esta aplicación');
    }

    let user = await this.prisma.user.findUnique({ where: { email: info.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: info.email,
          name: info.name,
          passwordHash: '',
          avatarUrl: info.picture,
          role: 'PASSENGER',
        },
      });
    }

    if (!user.active) throw new UnauthorizedException('Cuenta inactiva');

    const tokens = await this.generarTokens(user.id.toString(), user.email, user.role);
    return {
      usuario: { id: user.id.toString(), nombre: user.name, email: user.email, rol: user.role },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId: BigInt(userId), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async generarTokens(userId: string, email: string, role: string) {
    const payload: TokenPayload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRATION || '15m') as StringValue,
    });

    const refreshExpiracion = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
    const expiresAt = new Date();
    if (refreshExpiracion.endsWith('d')) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(refreshExpiracion));
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    await this.prisma.refreshToken.deleteMany({
      where: { userId: BigInt(userId), revokedAt: null },
    });

    const rt = await this.prisma.refreshToken.create({
      data: {
        userId: BigInt(userId),
        token: this.jwtService.sign(payload, { expiresIn: refreshExpiracion as StringValue }),
        expiresAt,
      },
    });

    return { accessToken, refreshToken: rt.token };
  }
}
