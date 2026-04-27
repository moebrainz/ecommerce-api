import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PaymentDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Endpoint: POST /checkout/payment
   * Process: Expects a specific Order identifier and a validated Mock gateway string.
   * Hands off parsing to the Checkout Service layer to delay & resolve asynchronously.
   */
  @Post('payment')
  @ApiOperation({ summary: 'Process a mock payment for an order' })
  processPayment(@Request() req: any, @Body() dto: PaymentDto) {
    return this.checkoutService.processPayment(req.user.id, dto);
  }
}
