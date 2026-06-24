import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages.service';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  namespace: 'messages',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Rate limiting map: userId -> { count: number, resetAt: number }
  private rateLimits = new Map<string, { count: number; resetAt: number }>();

  // Track connected users for dynamic room joins
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // 1. JWT in WebSocket: token via socket.handshake.auth.token (recommended)
      let token = client.handshake.auth?.token;
      if (!token && client.handshake.query?.token) {
        token = client.handshake.query.token as string;
      }

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'secret' });
      client.data.user = decoded; // { sub: string, email: string }

      // Join all conversation rooms
      const conversations = await this.prisma.conversationParticipant.findMany({
        where: { userId: decoded.sub }
      });
      
      const rooms = conversations.map(c => `conversation_${c.conversationId}`);
      if (rooms.length > 0) {
        client.join(rooms);
        client.emit('joinedRooms', rooms);
      }
      
      // Add to tracking
      if (!this.userSockets.has(decoded.sub)) {
        this.userSockets.set(decoded.sub, new Set());
      }
      this.userSockets.get(decoded.sub)!.add(client.id);

      console.log(`[MessagesGateway] User ${decoded.sub} connected to ${rooms.length} conversation rooms`);
    } catch (err) {
      console.error(`[MessagesGateway] Auth failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  // Allow backend services to dynamically add a user to a room
  addUserToRoom(userId: string, roomName: string) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(roomName);
          console.log(`[MessagesGateway] User ${userId} (Socket ${socketId}) joined dynamically to ${roomName}`);
        }
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string; type?: string }
  ) {
    const userId = client.data.user?.sub;
    if (!userId) return;

    // 2. Rate limiting for WebSocket sendMessage event (e.g. max 5 msgs/sec per user)
    const now = Date.now();
    const limitRecord = this.rateLimits.get(userId) || { count: 0, resetAt: now + 1000 };
    
    if (now > limitRecord.resetAt) {
      // Reset limit window
      limitRecord.count = 1;
      limitRecord.resetAt = now + 1000;
    } else {
      limitRecord.count++;
    }
    this.rateLimits.set(userId, limitRecord);

    if (limitRecord.count > 5) {
      // Reject with error event if threshold exceeded
      client.emit('error', { message: 'Bạn gửi tin nhắn quá nhanh. Vui lòng thử lại sau.' });
      return;
    }

    // Save message and update conversation
    try {
      const message = await this.messagesService.saveMessage(
        payload.conversationId,
        userId,
        payload.content,
        payload.type || 'text'
      );

      // Broadcast to everyone in the room (including sender to confirm receipt)
      this.server.to(`conversation_${payload.conversationId}`).emit('newMessage', message);
    } catch (err) {
      console.error(err);
      client.emit('error', { message: 'Lỗi khi gửi tin nhắn' });
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const userId = client.data.user?.sub;
    if (!userId) return;

    try {
      await this.messagesService.markAsRead(payload.conversationId, userId);
      // Broadcast read receipt so the other user knows
      this.server.to(`conversation_${payload.conversationId}`).emit('messagesRead', { 
        conversationId: payload.conversationId, 
        readBy: userId 
      });
    } catch (err) {
      console.error(err);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const roomName = `conversation_${payload.conversationId}`;
    client.join(roomName);
    client.emit('roomJoined', { conversationId: payload.conversationId });
    console.log(`[MessagesGateway] Client ${client.id} joined ${roomName}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const roomName = `conversation_${payload.conversationId}`;
    client.leave(roomName);
    console.log(`[MessagesGateway] Client ${client.id} left ${roomName}`);
  }
}
