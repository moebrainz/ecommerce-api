import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Products') // Swagger Grouping
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Endpoint: POST /products
   * Roles Required: ADMIN
   * Process: Accepts a validated AddProductDto and creates an inventory item.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Protects route: User must be logged in & pass Roles check
  @Roles('ADMIN') // Specifies that ONLY users whose JWT payload contains role "ADMIN" can enter
  @ApiBearerAuth() // Adds the lock icon in Swagger
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Endpoint: GET /products
   * Roles Required: NONE (Public)
   * Process: Extracts optional "cursor" and "limit" from the query params (?cursor=x&limit=y)
   */
  @Get()
  @ApiOperation({ summary: 'Get a paginated list of products' })
  @ApiQuery({ name: 'cursor', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    // Converts the string query parameters into numbers if they exist, then fetches.
    return this.productsService.findAll(cursor ? +cursor : undefined, limit ? +limit : 10);
  }

  /**
   * Endpoint: GET /products/:id
   * Roles Required: NONE
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  /**
   * Endpoint: PATCH /products/:id
   * Roles Required: ADMIN
   * Process: Safely updates specific fields (like stock or price) for an item
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  /**
   * Endpoint: DELETE /products/:id
   * Roles Required: ADMIN
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
