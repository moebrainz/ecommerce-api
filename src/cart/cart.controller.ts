import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id); // Explicitly maps the action specifically to that user.
  }

  /**
   * Endpoint: POST /cart/items
   * Process: Executes the Cart merge constraints.
   */
  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  /**
   * Endpoint: PATCH /cart/items/:id
   * Process: Specifically updates a line item configuration inside the cart.
   */
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateQuantity(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    // Converts the string ':id' parameter natively into a number via `+id` for DB parsing.
    return this.cartService.updateQuantity(req.user.id, +id, dto);
  }

  /**
   * Endpoint: DELETE /cart/items/:id
   * Process: Snips the item completely from the relational mapping.
   */
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeFromCart(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.id, +id);
  }
}
