import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Custom Decorator: `@Roles('ADMIN')`
 * Actively injects securely isolated role requirements directly into the Express Request metadata
 * so that our RolesGuard can evaluate it natively.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
