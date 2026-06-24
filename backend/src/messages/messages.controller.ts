import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create or get a conversation with another user' })
  createConversation(@Request() req: any, @Body() body: { targetUserId: string; rideId?: string }) {
    return this.messagesService.createConversation(req.user.id, body.targetUserId, body.rideId);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of conversations for current user' })
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  getMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;
    return this.messagesService.getMessages(id, req.user.id, skipNum, takeNum);
  }
}
