import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, ValidateNested } from 'class-validator';

export class variantDto {
  @ApiModelPropertyOptional()
  @IsString()
  readonly option?: string;
  @ApiModelPropertyOptional()
  @IsNumber()
  readonly price?: number;
  @ApiModelPropertyOptional()
  @IsString()
  readonly sku?: string;
}