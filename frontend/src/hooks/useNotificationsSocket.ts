import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseNotificationsSocketOptions {
  token: string | null;
  onNewNotification?: (notification: any) => void;
}

export const useNotificationsSocket = ({ token, onNewNotification }: UseNotificationsSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    let SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    if (SOCKET_URL === '/api') SOCKET_URL = 'http://localhost:3002';
    const cleanUrl = SOCKET_URL.replace(/\/api$/, '');
    console.log(`Initializing Notifications Socket with URL: ${cleanUrl}/notifications`);
    
    const socket = io(`${cleanUrl}/notifications`, {
      auth: { token },
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('Notifications Socket connected:', socket.id);
      setIsConnected(true);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Notifications Socket connect error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Notifications Socket disconnected:', reason);
      setIsConnected(false);
    });
    
    // We use a ref so the callback inside socket.on doesn't close over stale props
    // Actually, in useMessagesSocket we used it directly.
    if (onNewNotification) socket.on('newNotification', onNewNotification);

    socketRef.current = socket;

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      if (onNewNotification) socket.off('newNotification', onNewNotification);
      socket.disconnect();
    };
  }, [token]);

  return { isConnected };
};
