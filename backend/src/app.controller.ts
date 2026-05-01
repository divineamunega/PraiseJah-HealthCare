import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'API Root Information' })
  @ApiResponse({ status: 200, description: 'Welcome message and documentation link' })
  getHello() {
    return {
      message: 'Welcome to the PraiseJah HealthCare API',
      version: '1.0',
      documentation: '/api/v1/docs',
      note: 'All API endpoints are prefixed with /api/v1',
    };
  }
}
