import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: true, credentials: true }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users
  private userSockets: Map<string, Set<string>> = new Map();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      const userId = decoded.sub;

      client.data.user = decoded;

      // Add to tracking
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join a room for this user
      client.join(`user_${userId}`);

      console.log(`[NotificationsGateway] User ${userId} connected`);
    } catch (err: any) {
      console.error(`[NotificationsGateway] Auth failed: ${err.message}`);
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

  sendNotification(userId: string, notification: any) {
    console.log(`[NotificationsGateway] Emitting newNotification to user_${userId}:`, notification);
    this.server.to(`user_${userId}`).emit('newNotification', notification);
  }
}
