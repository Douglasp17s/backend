import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CrearLocationTestDto } from './crear-location-test.dto';

export class ActualizarLocationTestDto extends PartialType(CrearLocationTestDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
