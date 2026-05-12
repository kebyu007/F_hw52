import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/models/user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserRoles } from '@/core/constants/constants';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(payload: SignInDto, res: Response) {
    const existing = await this.userModel.findOne({ email: payload.email });

    if (!existing) {
      throw new NotFoundException('User not exists');
    }

    const isSame = await this.comparePass(payload.password, existing.password);

    if (!isSame) {
      throw new ConflictException('Password mismatch');
    }

    const accessToken = await this.generateAccessToken({
      id: existing.id,
      role: existing.role,
    });

    const refreshToken = await this.generateRefreshToken({
      id: existing.id,
      role: existing.role,
    });
    res.cookie('accessToken', accessToken, {
      signed: true,
      expires: new Date(
        Date.now() + (this.configService.get<number>('ACC_T_EX') || 0) * 1000,
      ),
    });
    res.cookie('refreshToken', refreshToken, { signed: true });

    return res.json({
      success: true,
      data: existing.toObject(),
    });
  }

  async register(payload: SignUpDto, res: Response) {
    const existing = await this.userModel.findOne({ email: payload.email });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const user = await this.userModel.create({
      name: payload.name,
      age: payload.age,
      email: payload.email,
      password: await this.hashPass(payload.password),
    });

    const accessToken = await this.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = await this.generateRefreshToken({
      id: user.id,
      role: user.role,
    });
    res.cookie('accessToken', accessToken, {
      signed: true,
      expires: new Date(
        Date.now() + (this.configService.get<number>('ACC_T_EX') || 0) * 1000,
      ),
    });
    res.cookie('refreshToken', refreshToken, { signed: true });

    return res.json({
      success: true,
      data: user.toObject(),
    });
  }

  async forgotPass() {}

  async resetPass() {}

  private async hashPass(pass: string): Promise<string> {
    const hPass = await bcrypt.hash(pass, 10);
    return hPass;
  }

  private async comparePass(orPass: string, hPass: string): Promise<boolean> {
    const isSame = await bcrypt.compare(orPass, hPass);
    return isSame;
  }

  private async generateAccessToken(payload: { id: string; role: UserRoles }) {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.access_key'),
      expiresIn: this.configService.get('jwt.access_ex'),
    });

    return token;
  }

  private async generateRefreshToken(payload: { id: string; role: UserRoles }) {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refresh_key'),
      expiresIn: this.configService.get('jwt.refresh_ex'),
    });

    return token;
  }
}
