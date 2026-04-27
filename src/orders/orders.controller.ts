import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../database/schemas/user.schema';
import { OrdersService } from './orders.service';

interface RequestWithUser extends Request {
  user: UserDocument;
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Fully protected routes.
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Endpoint: POST /orders
   * Process: Directly triggers the atomic transaction flow which absorbs the active cart
   * and mutates the current snapshot natively into a static Orders ledger!
   */
  @Post()
  @ApiOperation({ summary: 'Create an order from the current cart' })
  createOrder(@Request() req: RequestWithUser) {
    return this.ordersService.createOrderFromCart(req.user.id);
  }

  /**
   * Endpoint: GET /orders
   * Process: Yields a sorted history list from previous finalized carts/orders matching Request ID.
   */
  @Get()
  @ApiOperation({ summary: 'Get order history' })
  getOrderHistory(@Request() req: RequestWithUser) {
    return this.ordersService.getOrderHistory(req.user.id);
  }

  /**
   * Endpoint: GET /orders/:id
   * Process: Specific deeper dive into one uniquely scoped order item manifest.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrderDetails(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.getOrderDetails(req.user.id, id);
  }
}
