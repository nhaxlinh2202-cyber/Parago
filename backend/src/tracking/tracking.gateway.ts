import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*', // For dev. In prod, lock to domain
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  // Map socketId -> userId
  private connectedClients = new Map<string, string>();

  constructor(
    private trackingService: TrackingService,
    private jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload || !payload.sub) {
        client.disconnect();
        return;
      }

      this.connectedClients.set(client.id, payload.sub);
      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (e) {
      this.logger.error('Connection error', e);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRide')
  handleJoinRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string }
  ) {
    if (!data.rideId) return;
    client.join(`ride_${data.rideId}`);
    this.logger.log(`Socket ${client.id} joined room: ride_${data.rideId}`);
    
    // Push current known locations to the newly joined client
    this.trackingService.getRideLocations(data.rideId).then(locations => {
      client.emit('locationsUpdate', locations);
    });
  }

  @SubscribeMessage('leaveRide')
  handleLeaveRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string }
  ) {
    if (!data.rideId) return;
    client.leave(`ride_${data.rideId}`);
    this.logger.log(`Socket ${client.id} left room: ride_${data.rideId}`);
  }

  @SubscribeMessage('updateLocation')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; lat: number; lng: number }
  ) {
    const userId = this.connectedClients.get(client.id);
    if (!userId || !data.rideId || !data.lat || !data.lng) return;

    // Save to Redis (or memory fallback)
    await this.trackingService.setLocation(userId, data.rideId, data.lat, data.lng);

    // Get all latest locations for this ride
    const locations = await this.trackingService.getRideLocations(data.rideId);

    // Broadcast to everyone in the room (including sender, or use .to().except() if needed)
    this.server.to(`ride_${data.rideId}`).emit('locationsUpdate', locations);
  }

  @SubscribeMessage('triggerSOS')
  async handleSOS(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; lat: number; lng: number }
  ) {
    const userId = this.connectedClients.get(client.id);
    if (!userId || !data.rideId || !data.lat || !data.lng) return;

    // 1. Write to database
    const alert = await this.trackingService.triggerSOS(data.rideId, userId, data.lat, data.lng);

    // 2. Broadcast to everyone in the ride room
    this.server.to(`ride_${data.rideId}`).emit('sosAlert', alert);

    // 3. Broadcast to admin namespace if we had one
    this.server.emit('admin_sosAlert', alert); // Just emit globally on this namespace for now
  }
}
