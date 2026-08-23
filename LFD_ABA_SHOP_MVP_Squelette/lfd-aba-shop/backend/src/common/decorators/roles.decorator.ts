import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Usage : @Roles('DIRECTION', 'GESTIONNAIRE') au-dessus d'un contrôleur ou d'une route.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
