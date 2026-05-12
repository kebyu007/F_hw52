import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import type { Response, Request } from 'express';
import { SignInDto } from './dtos/sign-in.dto';
import { Protected } from '@/common/decorators/protected.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoles } from '@/core/constants/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Protected(false)
  @Roles([UserRoles.viewer])
  @Post('/sign-up')
  async signUp(@Body() payload: SignUpDto, @Res() res: Response) {
    return await this.service.register(payload, res);
  }

  @Protected(false)
  @Roles([UserRoles.viewer])
  @Post('/sign-in')
  async signIn(@Body() payload: SignInDto, @Res() res: Response) {
    return await this.service.login(payload, res);
  }
}
