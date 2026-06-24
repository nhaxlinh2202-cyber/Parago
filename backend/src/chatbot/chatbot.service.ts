import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private aiClient: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.aiClient = new GoogleGenAI({ apiKey });
    }
  }

  private getSystemInstruction(): string {
    return `Bạn là trợ lý ảo của Parago — nền tảng đi chung xe cho sinh viên đại học.
Nhiệm vụ của bạn: Chỉ trả lời các câu hỏi liên quan tới cách sử dụng app, tính năng, an toàn, chính sách của Parago. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt. Không xưng hô máy móc.
Nếu được hỏi điều gì ngoài phạm vi app (không liên quan Parago, code, toán học v.v.), lịch sự từ chối và hướng người dùng quay lại chủ đề app.

Thông tin nền về Parago:
- Ứng dụng giúp sinh viên tìm và đăng chuyến đi chung xe (xe máy, ô tô) để tiết kiệm chi phí và bảo vệ môi trường.
- Người dùng có thể đăng ký bằng email trường đại học để được xác thực (Verified badge).
- 2 Chế độ đi chung: 
  + Giao lưu (Community): Đi chung miễn phí, chia sẻ niềm vui.
  + Chia sẻ chi phí (Gas & Tip): Người đi chung đóng góp tiền xăng xe (giá do sinh viên tự thương lượng, rất rẻ).
- Tính năng ghép xe thông minh: Ưu tiên cùng trường, cùng giờ, gần điểm đón.
- Có tính năng SOS khẩn cấp trong phần Live Tracking (chia sẻ vị trí thực thời gian).
- Parago Premium (Bạn Đồng Hành): Tính năng trả phí cho phép thiết lập chuyến đi định kỳ, tuỳ chọn ghép cùng giới tính, tự động ghép điểm đón tối ưu, được tăng Trust Score.`;
  }

  async handleUserMessage(userId: string, content: string) {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.aiClient = new GoogleGenAI({ apiKey });
      } else {
        throw new HttpException('Chatbot hiện đang bảo trì (Thiếu cấu hình).', HttpStatus.SERVICE_UNAVAILABLE);
      }
    }

    try {
      // 1. Save user message to DB
      await this.prisma.chatbotMessage.create({
        data: {
          userId,
          role: 'user',
          content,
        }
      });

      // 2. Fetch history (last 10 messages)
      const history = await this.prisma.chatbotMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Format for Gemini API (chronological order)
      history.reverse();
      const contents = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // 3. Call Gemini API
      let replyText = "";
      try {
        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: this.getSystemInstruction(),
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        });
        replyText = response.text || "Xin lỗi, tôi chưa thể trả lời câu hỏi này.";
      } catch (genAiError: any) {
        this.logger.error('Gemini API Error:', genAiError);
        // Check for 429
        if (genAiError.status === 429 || genAiError.message?.includes('429')) {
          throw new HttpException('Trợ lý đang bận, vui lòng thử lại sau giây lát.', HttpStatus.TOO_MANY_REQUESTS);
        }
        throw new HttpException('Lỗi khi kết nối với hệ thống Trợ lý.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 4. Save bot response to DB
      const botMessage = await this.prisma.chatbotMessage.create({
        data: {
          userId,
          role: 'assistant',
          content: replyText,
        }
      });

      return {
        success: true,
        data: botMessage
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('ChatbotService Error:', error);
      throw new HttpException('Đã có lỗi xảy ra khi xử lý tin nhắn.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getHistory(userId: string) {
    const messages = await this.prisma.chatbotMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return {
      success: true,
      data: messages
    };
  }
}
