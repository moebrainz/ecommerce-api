import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard serves as an HTTP wall.
 * When applied to a route (e.g. `@UseGuards(JwtAuthGuard)`), it intrinsically mandates that
 * the incoming HTTP Request must contain a valid HTTP Bearer 'Authorization' Token header.
 *
 * If it doesn't, this Guard natively throws a 401 Unauthorized exception before logic even executes.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
