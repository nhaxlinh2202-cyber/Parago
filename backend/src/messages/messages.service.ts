import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(userId: string, targetUserId: string, rideId?: string) {
    if (userId === targetUserId) {
      throw new ForbiddenException('Cannot create conversation with yourself');
    }

    // Check if conversation already exists between these 2 users (and optionally rideId)
    // Actually, if rideId is provided, we check if there's a conversation for this ride between them
    // If not, we just check if there's any conversation between them without rideId (or we can just query any conversation with exactly these two participants)
    
    // Find conversations where both users are participants
    const existingConvos = await this.prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        participants: true
      }
    });

    // We only want conversations that have EXACTLY these two users
    let existingConversation = existingConvos.find(c => c.participants.length === 2);

    // If rideId is provided, prefer the one with the same rideId, or just use the existing one
    // Let's strictly check rideId if provided
    if (rideId) {
       const exactRideConvo = existingConvos.find(c => c.participants.length === 2 && c.rideId === rideId);
       if (exactRideConvo) {
         existingConversation = exactRideConvo;
       }
    }

    if (existingConversation) {
      return { id: existingConversation.id };
    }

    // Create new
    const newConvo = await this.prisma.conversation.create({
      data: {
        rideId,
        participants: {
          create: [
            { userId },
            { userId: targetUserId }
          ]
        }
      }
    });

    return { id: newConvo.id };
  }

  async getConversations(userId: string) {
    // Find all conversations where user is a participant
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId }
              }
            }
          }
        }
      },
      orderBy: [
        { lastMessageAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Format response
    return conversations.map(c => {
      const otherParticipant = c.participants.find(p => p.userId !== userId)?.user;
      return {
        id: c.id,
        rideId: c.rideId,
        lastMessageAt: c.lastMessageAt,
        lastMessageText: c.lastMessageText,
        createdAt: c.createdAt,
        unreadCount: c._count.messages,
        otherUser: otherParticipant
      };
    });
  }

  async getMessages(conversationId: string, userId: string, skip = 0, take = 20) {
    // Verify participant and get conversation details
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId }
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
              include: { user: { select: { id: true, name: true, avatarUrl: true } } }
            }
          }
        }
      }
    });
    if (!participant) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Mark as read in background (or immediately)
    // Only mark messages sent by OTHERS as read
    const unreadMessagesIds = messages.filter(m => m.senderId !== userId && !m.isRead).map(m => m.id);
    if (unreadMessagesIds.length > 0) {
      await this.prisma.message.updateMany({
        where: { id: { in: unreadMessagesIds } },
        data: { isRead: true }
      });
      // We also update the returned messages array so it reflects the change immediately
      messages.forEach(m => {
        if (unreadMessagesIds.includes(m.id)) {
          m.isRead = true;
        }
      });
    }

    const otherUser = participant.conversation.participants[0]?.user;
    
    // Return in chronological order (oldest first for chat UI)
    return {
      conversation: {
        ...participant.conversation,
        otherUser
      },
      messages: messages.reverse()
    };
  }

  async saveMessage(conversationId: string, senderId: string, text: string, type: string = 'text') {
    // Save message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        text,
        type
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Update conversation lastMessage info
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: text
      }
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });
  }
}
