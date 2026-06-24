import { Controller, Post, Get, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Chatbot')
@Controller('chatbot')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message to the Parago AI Assistant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'Làm sao để đăng chuyến đi mới?' }
      }
    }
  })
  async sendMessage(@Request() req: any, @Body('content') content: string) {
    const userId = req.user.id;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new HttpException('Tin nhắn không được để trống.', HttpStatus.BAD_REQUEST);
    }

    if (content.length > 500) {
      throw new HttpException('Tin nhắn quá dài. Vui lòng gửi dưới 500 ký tự.', HttpStatus.BAD_REQUEST);
    }

    return this.chatbotService.handleUserMessage(userId, content);
  }

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chatbot conversation history' })
  async getHistory(@Request() req: any) {
    const userId = req.user.id;
    return this.chatbotService.getHistory(userId);
  }
}
