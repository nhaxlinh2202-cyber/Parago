import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('make-admin')
  async makeAdmin(@Query('email') email: string) {
    if (!email) return "Vui lòng cung cấp email! Ví dụ: /make-admin?email=your@email.com";
    
    try {
      await this.prisma.user.update({
        where: { email },
        data: { systemRole: 'ADMIN' }
      });
      return `Thành công! Tài khoản ${email} đã trở thành ADMIN. Hãy tải lại trang web Parago và vào /admin.`;
    } catch (e) {
      return `Lỗi: Không tìm thấy tài khoản có email ${email}. Vui lòng đăng ký trước!`;
    }
  }
}
