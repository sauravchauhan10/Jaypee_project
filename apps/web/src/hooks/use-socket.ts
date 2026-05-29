import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';

let socketInstance: Socket | null = null;

export const useSocket = (): { socket: Socket | null; isConnected: boolean } => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    if (!socketInstance) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      socketInstance = io(backendUrl, {
        withCredentials: true,
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, we want the connection to persist across page navigations
      // It only disconnects when auth state changes to logged out
    };
  }, [isAuthenticated]);

  return { socket, isConnected };
};
