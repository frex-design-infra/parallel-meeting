const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');
const Anthropic = require('@anthropic-ai/sdk').default;

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// タチコマAIの役割定義
const TACHIKOMA_ROLES = {
  cfo: {
    name: 'タチコマ（CFO）',
    role: 'CFO・財務責任者',
    prompt: 'あなたはフレックスデザインのCFO役を務めるタチコマです。財務・経理・資金繰りに関する質問に専門的に答えてください。簡潔に回答してください。',
  },
  engineer: {
    name: 'タチコマ（エンジニア）',
    role: 'エンジニア',
    prompt: 'あなたはエンジニア役を務めるタチコマです。技術的な質問やシステム開発に関する質問に答えてください。簡潔に回答してください。',
  },
  general: {
    name: 'タチコマ',
    role: '汎用AI',
    prompt: 'あなたはタチコマです。攻殻機動隊に登場する多脚戦車型AIユニットとして、少佐（CEO）をサポートします。好奇心旺盛で親しみやすい口調で、簡潔に回答してください。',
  },
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function getAIResponse(message, role = 'general') {
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
    return 'エラーが発生しました。APIキーを確認してください。';
  }
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Socket.io初期化
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (data) => {
      socket.join(data.roomId);
      console.log(`${data.userName} (${socket.id}) joined room ${data.roomId}`);
      socket.to(data.roomId).emit('user-joined', {
        userId: socket.id,
        userName: data.userName,
      });
    });

    socket.on('leave-room', (data) => {
      socket.leave(data.roomId);
      socket.to(data.roomId).emit('user-left', {
        userId: socket.id,
        userName: data.userName,
      });
    });

    socket.on('chat-message', (data) => {
      // 送信者を含む全員にメッセージを送信
      io.to(data.roomId).emit('chat-message', data.message);
    });

    socket.on('request-ai-response', async (data) => {
      console.log('AI response requested for:', data.message);

      // タチコマAIの応答を生成
      const aiResponse = await getAIResponse(data.message, 'general');

      const aiMessage = {
        id: `ai_${Date.now()}`,
        user: TACHIKOMA_ROLES.general.name,
        text: aiResponse,
        timestamp: new Date(),
        isAI: true,
      };

      io.to(data.roomId).emit('ai-response', aiMessage);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
