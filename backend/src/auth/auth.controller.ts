import { Post, Body, Req, Res, Ip, Headers, Controller, HttpCode } from '@nestjs/common';
import type { Request, Response } from 'express';
import LoginDto from './login.dto.js';
import { AuthService } from './auth.service.js';
import { UAParser } from 'ua-parser-js';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) { }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers() headers: any,
  ) {
    const userAgent = headers.get
      ? headers.get('user-agent')
      : headers['user-agent'];
    const deviceInfo = UAParser(userAgent || undefined);

    const data = await this.authService.login(loginDto, {
      ip,
      userAgent: userAgent || null,
      deviceInfo: deviceInfo.browser.name && deviceInfo.os.name ? `${deviceInfo.browser.name} ${deviceInfo.browser.version} on ${deviceInfo.os.name} ${deviceInfo.os.version}` : undefined,
    });

    // Manually set the refresh token as HttpOnly cookie
    res.cookie('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms(this.config.getOrThrow('REFRESH_EXPIRES_IN')),
    });

    return {
      accessToken: data.accessToken, user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
      }
    };
  }
}
