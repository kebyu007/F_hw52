import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { protectedKey } from '../decorators/protected.decorator';
import { UserRoles } from '@/core/constants/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isProtected = this.reflector.get<boolean>(
      protectedKey,
      context.getHandler(),
    );
    if (!isProtected) return true;

    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user: any }>();
    const res = http.getResponse<Response>();

    const accessToken = req.signedCookies?.['accessToken'];
    const refreshToken = req.signedCookies?.['refreshToken'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided. Please log in.');
    }

    if (!accessToken && refreshToken) {
      req.user = await this.handleRefresh(refreshToken, res);
      return true;
    }

    try {
      req.user = await this.verifyAccessToken(accessToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        if (!refreshToken) {
          throw new UnauthorizedException(
            'Session expired. Please log in again.',
          );
        }
        req.user = await this.handleRefresh(refreshToken, res);
      } else {
        throw error;
      }
    }

    return true;
  }

  private async verifyAccessToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('jwt.access_key'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) throw error;
      if (error instanceof JsonWebTokenError)
        throw new UnauthorizedException('Invalid access token.');
      throw new InternalServerErrorException('Token verification failed.');
    }
  }

  private async handleRefresh(
    refreshToken: string,
    res: Response,
  ): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('REF_T_SC'),
      });

      const newAccessToken = await this.generateAccessToken({
        id: payload.sub,
        role: payload.role,
      });

      res.cookie('accessToken', newAccessToken, {
        signed: true,
        secure: this.configService.get('NODE_ENV') === 'production',
      });

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Session fully expired. Please log in again.',
        );
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      throw new InternalServerErrorException('Failed to refresh session.');
    }
  }

  private async generateAccessToken(payload: {
    id: string;
    role: UserRoles;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('jwt.access_key'),
      expiresIn: this.configService.getOrThrow('jwt.access_ex'),
    });
  }
}
