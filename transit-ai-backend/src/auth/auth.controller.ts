import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuditoriaService } from '../auditoria/auditoria.service';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditoria: AuditoriaService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const resultado = await this.authService.login(dto);

    // Registrar en auditoría
    try {
      const usuario = (resultado as any).usuario;
      if (usuario?.id) {
        console.log('📝 Registrando login en auditoría:', usuario.email);
        await this.auditoria.registrarAccion({
          userId: String(usuario?.id),
          userRole: usuario?.role,
          sindicatoId: usuario?.syndicateId ? String(usuario?.syndicateId) : undefined,
          action: 'LOGIN',
          tableName: 'auth_sessions',
          recordId: String(usuario?.id),
          recordName: `Login: ${usuario.email}`,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
        console.log('✅ Login registrado en auditoría');
      }
    } catch (e) {
      // No fallar si la auditoría falla
      console.error('❌ Error registrando login en auditoría:', e);
    }

    return resultado;
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginGoogle(@Body('idToken') idToken: string) {
    if (!idToken) throw new BadRequestException('idToken requerido');
    return this.authService.googleLogin(idToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user?: { id: string }) {
    if (user?.id) {
      await this.authService.logout(user.id);
    }
    return { exito: true, mensaje: 'Sesión cerrada correctamente' };
  }
}
