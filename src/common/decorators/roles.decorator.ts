import { UserRoles } from '@/core/constants/constants';
import { Reflector } from '@nestjs/core';

export const rolesKey = 'ROLES';
export const Roles = Reflector.createDecorator<UserRoles[]>({ key: rolesKey });
