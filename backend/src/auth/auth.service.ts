import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Ip,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import ms from 'ms';
import LoginDto from './login.dto.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) { }

  async login(
    loginDto: LoginDto,
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string },
  ) {
    // 1. look for user in the database and throw an error if the user does not exist
    const user = await this.userService.findUniqueByEmail(loginDto.email);

    // 2. compare the passed password to the hashed database password
    const isCorrect = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    // 3. throw an error if the password is incorrect
    if (!isCorrect) throw new UnauthorizedException("Incorrect email or password");

    // 4. Generate a jwt access token and a refresh token for this user
    const payload = { sub: user.id, email: user.email, role: user.role, status: user.status };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(32).toString('hex');

    // 5. hash the freshly generated refresh token and store it in the database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(
          ms(this.config.getOrThrow('REFRESH_EXPIRES_IN')) + Date.now(),
        ),
        ipAddress: requestInfo.ip,
        deviceInfo: requestInfo.deviceInfo || null,
        userAgent: requestInfo.userAgent || null,
      },
    });

    return { accessToken, refreshToken, user };
  }
}
