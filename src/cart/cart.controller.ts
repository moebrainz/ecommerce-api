import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../database/schemas/user.schema';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

interface RequestWithUser extends Request {
  user: UserDocument;
}

@ApiTags('Cart')
@ApiBearerAuth()
// Apply JwtAuthGuard globally to the entire controller: Requires a valid Bearer Token!
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Endpoint: GET /cart
   * Process: Uses the @Request() decorator to snatch the User identity from the parsed JWT.
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve your shopping cart' })
  getCart(@Request() req: RequestWithUser) {
    return this.cartService.getCart(req.user.id); // Explicitly maps the action specifically to that user.
  }

  /**
   * Endpoint: POST /cart/items
   * Process: Executes the Cart merge constraints.
   */
  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  addToCart(@Request() req: RequestWithUser, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  /**
   * Endpoint: PATCH /cart/items/:id
   * Process: Specifically updates a line item configuration inside the cart.
   */
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateQuantity(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(req.user.id, id, dto);
  }

  /**
   * Endpoint: DELETE /cart/items/:id
   * Process: Snips the item completely from the relational mapping.
   */
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeFromCart(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.id, id);
  }
}
