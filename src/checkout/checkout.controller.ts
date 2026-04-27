import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../database/schemas/user.schema';
import { CheckoutService } from './checkout.service';
import { PaymentDto } from './dto/checkout.dto';

interface RequestWithUser extends Request {
  user: UserDocument;
}

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
  processPayment(@Request() req: RequestWithUser, @Body() dto: PaymentDto) {
    return this.checkoutService.processPayment(req.user.id, dto);
  }
}
