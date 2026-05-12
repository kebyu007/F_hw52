import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { rolesKey } from '../decorators/roles.decorator';
import { UserRoles } from '@/core/constants/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(rolesKey, context.getHandler());

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const role = request?.user?.role || UserRoles.viewer;

    if (!roles.includes(role)) {
      throw new ForbiddenException("User don't have access");
    }

    return true;
  }
}
