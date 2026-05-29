import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import * as jose from 'jose';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      const { payload } = await jose.jwtVerify(token, secret);

      // Attach user info to socket
      socket.data.user = payload;
      
      // Join a room specific to this user so we can emit directly to them
      socket.join(`user:${payload.userId}`);
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: User ${socket.data.user.userId}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: User ${socket.data.user.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};
