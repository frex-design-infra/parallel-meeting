import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';

export const dynamic = 'force-dynamic';

let io: SocketIOServer | undefined;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = (req as any).socket?.server;

    if (httpServer && !httpServer.io) {
      io = new SocketIOServer(httpServer, {
        path: '/api/socketio',
        addTrailingSlash: false,
      });

      httpServer.io = io;

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join-room', (roomId: string) => {
          socket.join(roomId);
          console.log(`Socket ${socket.id} joined room ${roomId}`);
          socket.to(roomId).emit('user-joined', socket.id);
        });

        socket.on('leave-room', (roomId: string) => {
          socket.leave(roomId);
          socket.to(roomId).emit('user-left', socket.id);
        });

        socket.on('chat-message', (data: { roomId: string; message: string; sender: string }) => {
          io?.to(data.roomId).emit('chat-message', {
            message: data.message,
            sender: data.sender,
            timestamp: new Date().toISOString(),
          });
        });

        socket.on('transcription', (data: { roomId: string; text: string; speaker: string }) => {
          io?.to(data.roomId).emit('transcription', {
            text: data.text,
            speaker: data.speaker,
            timestamp: new Date().toISOString(),
          });
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });
    }
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
