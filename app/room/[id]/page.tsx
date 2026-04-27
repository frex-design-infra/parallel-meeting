'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import DailyIframe from '@daily-co/daily-js';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
}

interface Participant {
  id: string;
  name: string;
  isAI?: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const userName = searchParams.get('name') || 'ゲスト';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const dailyRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.io接続
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId, userName });
    });

    socket.on('user-joined', (data: { userId: string; userName: string }) => {
      setParticipants(prev => [...prev, { id: data.userId, name: data.userName }]);
      addSystemMessage(`${data.userName}が参加しました`);
    });

    socket.on('user-left', (data: { userId: string; userName: string }) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
      addSystemMessage(`${data.userName}が退出しました`);
    });

    socket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('ai-response', (message: Message) => {
      setMessages(prev => [...prev, { ...message, isAI: true }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userName]);

  // メッセージ自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: 'システム',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return;

    const message: Message = {
      id: Date.now().toString(),
      user: userName,
      text: inputText,
      timestamp: new Date(),
    };

    socketRef.current.emit('chat-message', { roomId, message });
    setMessages(prev => [...prev, message]);
    setInputText('');

    // タチコマAIに応答をリクエスト
    socketRef.current.emit('request-ai-response', { roomId, message: inputText });
  };

  const toggleMute = () => {
    if (dailyRef.current) {
      dailyRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (dailyRef.current) {
      dailyRef.current.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const leaveRoom = () => {
    if (dailyRef.current) {
      dailyRef.current.leave();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    window.location.href = '/';
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">🤖 AI Meeting Room</h1>
          <p className="text-sm text-gray-400">ルーム: {roomId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">👤 {userName}</span>
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* メインエリア */}
        <div className="flex-1 flex flex-col">
          {/* ビデオエリア */}
          <div className="bg-gray-800 p-4 h-64">
            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">音声通話エリア（Daily.co統合予定）</p>
            </div>
          </div>

          {/* チャットエリア */}
          <div className="flex-1 bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.user === userName ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.isAI
                        ? 'bg-purple-100 border border-purple-300'
                        : msg.user === 'システム'
                        ? 'bg-gray-100 text-gray-600 text-sm'
                        : msg.user === userName
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.user !== userName && msg.user !== 'システム' && (
                      <p className="text-xs font-semibold mb-1">
                        {msg.isAI ? '🤖 ' : ''}
                        {msg.user}
                      </p>
                    )}
                    <p className="break-words">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">参加者 ({participants.length + 1})</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
              <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                👤
              </span>
              <span className="text-sm">{userName} (あなた)</span>
            </div>
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm">
                  {p.isAI ? '🤖' : '👤'}
                </span>
                <span className="text-sm">{p.name}</span>
              </div>
            ))}
          </div>

          {/* コントロール */}
          <div className="mt-4 space-y-2">
            <button
              onClick={toggleMute}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? '🔇 ミュート中' : '🎤 ミュート'}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                isVideoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isVideoOn ? '📹 ビデオON' : '📹 ビデオOFF'}
            </button>
            <button
              onClick={leaveRoom}
              className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
