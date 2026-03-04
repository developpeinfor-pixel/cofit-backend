import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/jwt/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_GENERAL, Role.ADMIN_SENIOR, Role.ADMIN_JUNIOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard(@Req() req: { user: { userId: string; role: Role } }) {
    return this.adminService.getDashboard(req.user);
  }

  @Get('exports/stats.csv')
  @Roles(Role.ADMIN_GENERAL)
  async exportStatsCsv(@Res() res: Response) {
    const buffer = await this.adminService.exportStatsCsvBuffer();
    const timestamp = new Date().toISOString().replaceAll(':', '-');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cofit-stats-${timestamp}.csv"`,
    );
    return res.send(buffer);
  }

  @Get('exports/stats.pdf')
  @Roles(Role.ADMIN_GENERAL)
  async exportStatsPdf(@Res() res: Response) {
    const buffer = await this.adminService.exportStatsPdfBuffer();
    const timestamp = new Date().toISOString().replaceAll(':', '-');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cofit-stats-${timestamp}.pdf"`,
    );
    return res.send(buffer);
  }
}
