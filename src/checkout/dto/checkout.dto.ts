import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'tok_visa' })
  @IsString()
  paymentToken: string;
}
