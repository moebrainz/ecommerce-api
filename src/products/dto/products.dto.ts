import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Gaming Laptop' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'High performance gaming laptop' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1200.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Gaming Laptop Pro', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'High performance gaming laptop', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1400.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 45, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
