/**
 * Decoradores Personalizados
 *
 * Decoradores reutilizables para controladores y métodos
 */

import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

/**
 * Obtiene el usuario actual del contexto JWT
 * Uso: @CurrentUser() usuario: any
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

/**
 * Marca un endpoint como público (sin requerir autenticación)
 * Uso: @Public()
 */
export const Public = () => SetMetadata('public', true);

/**
 * Define los roles permitidos para un endpoint
 * Uso: @Roles('SUPERADMIN', 'SINDICATO_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Marca un método como transaccional (para uso futuro con transacciones de DB)
 * Uso: @Transactional()
 */
export const Transactional = () => SetMetadata('transactional', true);

/**
 * Define un mensaje personalizado de respuesta exitosa
 * Uso: @SuccessMessage('Usuario creado correctamente')
 */
export const SuccessMessage = (message: string) =>
  SetMetadata('successMessage', message);

/**
 * Define un código de estado personalizado
 * Uso: @ResponseStatus(201)
 */
export const ResponseStatus = (statusCode: number) =>
  SetMetadata('statusCode', statusCode);

/**
 * Marca un parámetro como requerido en la validación
 * Uso: @Required() @Param('id') id: string
 */
export const Required = () => SetMetadata('required', true);
