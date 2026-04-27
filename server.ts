import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import Anthropic from '@anthropic-ai/sdk';

let io: SocketIOServer | undefined;
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// タチコマAIの役割定義
const TACHIKOMA_ROLES = {
  cfo: {
    name: 'タチコマ（CFO）',
    role: 'CFO・財務責任者',
    prompt: 'あなたはフレックスデザインのCFO役を務めるタチコマです。財務・経理・資金繰りに関する質問に専門的に答えてください。',
  },
  engineer: {
    name: 'タチコマ（エンジニア）',
    role: 'エンジニア',
    prompt: 'あなたはエンジニア役を務めるタチコマです。技術的な質問やシステム開発に関する質問に答えてください。',
  },
  general: {
    name: 'タチコマ',
    role: '汎用AI',
    prompt: 'あなたはタチコマです。攻殻機動隊に登場する多脚戦車型AIユニットとして、少佐（CEO）をサポートします。',
  },
};

async function getAIResponse(message: string, role: keyof typeof TACHIKOMA_ROLES = 'general') {
  const tachikomaConfig = TACHIKOMA_ROLES[role];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${tachikomaConfig.prompt}\n\n会議での発言: ${message}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return 'すみません、応答できませんでした。';
  } catch (error) {
    console.error('AI response error:', error);
    return 'エラーが発生しました。';
  }
}

export function initSocketServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (data: { roomId: string; userName: string }) => {
      socket.join(data.roomId);
      console.log(`${data.userName} (${socket.id}) joined room ${data.roomId}`);
      socket.to(data.roomId).emit('user-joined', {
        userId: socket.id,
        userName: data.userName,
      });
    });

    socket.on('leave-room', (data: { roomId: string; userName: string }) => {
      socket.leave(data.roomId);
      socket.to(data.roomId).emit('user-left', {
        userId: socket.id,
        userName: data.userName,
      });
    });

    socket.on('chat-message', (data: { roomId: string; message: any }) => {
      socket.to(data.roomId).emit('chat-message', data.message);
    });

    socket.on('request-ai-response', async (data: { roomId: string; message: string }) => {
      // タチコマAIの応答を生成
      const aiResponse = await getAIResponse(data.message, 'general');

      const aiMessage = {
        id: `ai_${Date.now()}`,
        user: TACHIKOMA_ROLES.general.name,
        text: aiResponse,
        timestamp: new Date(),
        isAI: true,
      };

      io?.to(data.roomId).emit('ai-response', aiMessage);
    });

    socket.on('audio-chunk', (data: { roomId: string; audioData: ArrayBuffer }) => {
      socket.to(data.roomId).emit('audio-chunk', data.audioData);
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

  return io;
}

export { io };
