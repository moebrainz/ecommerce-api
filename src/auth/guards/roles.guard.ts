import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard introduces secure Role-Based Access Control (RBAC).
 * Once the JwtAuthGuard extracts the user details from the token, this guard compares the 
 * User's "Role" to our endpoint's specifically required roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Step 1: Detect what Roles are actively required by reading standard Metadata (set by @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Step 2: If the endpoint doesn't specifically require roles, securely let them through.
    if (!requiredRoles) {
      return true;
    }

    // Step 3: Fetch the requesting user directly from the parsed HTTP connection.
    const { user } = context.switchToHttp().getRequest();

    // Step 4: Verify that the User's explicit Database role natively matches what the endpoint demands.
    return requiredRoles.includes(user.role);
  }
}
