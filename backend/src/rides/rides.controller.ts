import { Controller, Post, Body, Get, UseGuards, Request, Query, Param, NotFoundException, Patch, Delete, ForbiddenException, ConflictException } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  async create(@Request() req: any, @Body() createRideDto: CreateRideDto) {
    return this.ridesService.createRide(req.user.id, createRideDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.ridesService.findAll(query);
  }

  @Get('my')
  async getMyRides(@Request() req: any, @Query('role') role: string) {
    return this.ridesService.getMyRides(req.user.id, role || 'driver');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ride = await this.ridesService.findOne(id);
    if (!ride) {
      throw new NotFoundException('Ride not found');
    }
    return ride;
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.ridesService.cancelRide(id, req.user.id, req.user.systemRole);
    } catch (e: any) {
      if (e.message === 'Forbidden') throw new ForbiddenException('Bạn không có quyền huỷ chuyến đi này');
      if (e.message === 'Ride not found') throw new NotFoundException('Không tìm thấy chuyến đi');
      throw e;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.ridesService.deleteRide(id, req.user.id, req.user.systemRole);
    } catch (e: any) {
      if (e.message === 'Forbidden') throw new ForbiddenException('Bạn không có quyền xoá chuyến đi này');
      if (e.message === 'Ride not found') throw new NotFoundException('Không tìm thấy chuyến đi');
      if (e.message === 'CONFLICT_ACCEPTED_PASSENGERS') {
        throw new ConflictException('Chuyến đi đã có hành khách, vui lòng dùng chức năng Huỷ chuyến thay vì xoá');
      }
      throw e;
    }
  }
  @Post(':id/request-join')
  async requestJoin(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.ridesService.requestJoin(id, req.user.id);
    } catch (e: any) {
      if (e.message === 'Already requested') throw new ConflictException('Bạn đã gửi yêu cầu rồi');
      if (e.message === 'Driver cannot join own ride') throw new ForbiddenException('Tài xế không thể ghép xe với chính mình');
      if (e.message === 'Ride not found') throw new NotFoundException('Không tìm thấy chuyến đi');
      throw e;
    }
  }

  @Patch(':id/passengers/:passengerId')
  async updatePassengerStatus(
    @Param('id') id: string,
    @Param('passengerId') passengerId: string,
    @Body('action') action: 'ACCEPT' | 'REJECT',
    @Request() req: any
  ) {
    try {
      return await this.ridesService.updatePassengerStatus(id, passengerId, req.user.id, action);
    } catch (e: any) {
      if (e.message === 'Forbidden') throw new ForbiddenException('Bạn không phải là tài xế của chuyến đi này');
      if (e.message === 'Request not found') throw new NotFoundException('Không tìm thấy yêu cầu');
      if (e.message === 'Request already processed') throw new ConflictException('Yêu cầu này đã được xử lý');
      if (e.message === 'No seats available') throw new ConflictException('Đã hết ghế trống');
      if (e.message === 'Ride not found') throw new NotFoundException('Không tìm thấy chuyến đi');
      throw e;
    }
  }
  @Delete(':id/request-join')
  async cancelJoinRequest(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.ridesService.cancelJoinRequest(id, req.user.id);
    } catch (e: any) {
      if (e.message === 'Request not found') throw new NotFoundException('Không tìm thấy yêu cầu ghép xe');
      if (e.message === 'Cannot cancel rejected request') throw new ConflictException('Không thể huỷ yêu cầu đã bị từ chối');
      throw e;
    }
  }
}
