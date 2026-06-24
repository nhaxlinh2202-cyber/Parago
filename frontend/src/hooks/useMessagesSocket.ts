import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseMessagesSocketOptions {
  token: string | null;
  onNewMessage?: (message: any) => void;
  onMessagesRead?: (data: { conversationId: string, readBy: string }) => void;
  onError?: (error: any) => void;
}

export const useMessagesSocket = ({ token, onNewMessage, onMessagesRead, onError }: UseMessagesSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    let SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    if (SOCKET_URL === '/api') SOCKET_URL = 'http://localhost:3002';
    // Clean up the URL in case it has /api at the end
    const cleanUrl = SOCKET_URL.replace(/\/api$/, '');
    console.log(`Initializing Messages Socket with URL: ${cleanUrl}/messages`);
    
    const socket = io(`${cleanUrl}/messages`, {
      auth: { token },
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('Messages Socket connected:', socket.id);
      setIsConnected(true);
    });
    
    socket.on('connect_error', (err) => {
      console.error('Messages Socket connect error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Messages Socket disconnected:', reason);
      setIsConnected(false);
    });
    
    if (onNewMessage) socket.on('newMessage', onNewMessage);
    if (onMessagesRead) socket.on('messagesRead', onMessagesRead);
    if (onError) socket.on('error', onError);

    socketRef.current = socket;

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      if (onNewMessage) socket.off('newMessage', onNewMessage);
      if (onMessagesRead) socket.off('messagesRead', onMessagesRead);
      if (onError) socket.off('error', onError);
      socket.disconnect();
    };
  }, [token]);

  const sendMessage = (conversationId: string, content: string, type: string = 'text') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', { conversationId, content, type });
    }
  };

  const markRead = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markRead', { conversationId });
    }
  };

  const joinRoom = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', { conversationId });
    }
  };

  const leaveRoom = (conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', { conversationId });
    }
  };

  return { isConnected, sendMessage, markRead, joinRoom, leaveRoom };
};
