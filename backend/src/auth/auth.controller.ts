import { Post, Body, Req, Res, Ip, Headers, Controller, HttpCode, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import LoginDto from './dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { UAParser } from 'ua-parser-js';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import type { User } from '@prisma/client';

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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers() headers: any,
  ) {
    const userAgent = headers.get
      ? headers.get('user-agent')
      : headers['user-agent'];
    const deviceInfo = UAParser(userAgent || undefined);
    const correlationId = req['correlationId'];

    const data = await this.authService.login(loginDto, {
      ip,
      userAgent: userAgent || null,
      deviceInfo: deviceInfo.browser.name && deviceInfo.os.name ? `${deviceInfo.browser.name} ${deviceInfo.browser.version} on ${deviceInfo.os.name} ${deviceInfo.os.version}` : undefined,
      correlationId,
    });

    this.setRefreshTokenCookie(res, data.refreshToken);

    return {
      accessToken: data.accessToken, user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        status: data.user.status,
      }
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers() headers: any,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const userAgent = headers.get
      ? headers.get('user-agent')
      : headers['user-agent'];
    const deviceInfo = UAParser(userAgent || undefined);
    const correlationId = req['correlationId'];

    const data = await this.authService.refreshTokens(refreshToken, {
      ip,
      userAgent: userAgent || null,
      deviceInfo: deviceInfo.browser.name && deviceInfo.os.name ? `${deviceInfo.browser.name} ${deviceInfo.browser.version} on ${deviceInfo.os.name} ${deviceInfo.os.version}` : undefined,
      correlationId,
    });

    this.setRefreshTokenCookie(res, data.refreshToken);

    return {
      accessToken: data.accessToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        status: data.user.status,
      }
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken, req['correlationId']);
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @Req() req: Request,
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto, req['correlationId']);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Req() req: Request,
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, req['correlationId']);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Req() req: Request,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto, req['correlationId']);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms(this.config.getOrThrow('REFRESH_EXPIRES_IN')),
    });
  }
}
