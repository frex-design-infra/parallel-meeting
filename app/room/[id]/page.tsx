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
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-slate-900/90 to-blue-900/90 backdrop-blur-sm border-b border-cyan-500/30 text-white p-4 flex justify-between items-center shadow-lg shadow-cyan-500/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AI Meeting Room</h1>
            <p className="text-xs text-cyan-400/70 font-mono">ROOM: {roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-cyan-500/30">
            <span className="text-sm font-mono text-cyan-300">{userName}</span>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* メインエリア */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* ビデオエリア */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 h-64 border-b border-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-slate-800/50 to-blue-900/30 rounded-xl border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                  <span className="text-3xl">🎙️</span>
                </div>
                <p className="text-cyan-300/60 font-mono text-sm">VOICE COMMUNICATION</p>
                <p className="text-cyan-400/40 text-xs mt-1">Daily.co Integration Pending</p>
              </div>
            </div>
          </div>

          {/* チャットエリア */}
          <div className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col min-h-0 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin pb-20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.user === userName ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl backdrop-blur-sm shadow-lg ${
                      msg.isAI
                        ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/50 shadow-purple-500/20'
                        : msg.user === 'システム'
                        ? 'bg-slate-800/30 border border-cyan-500/20 text-cyan-300/60 text-sm'
                        : msg.user === userName
                        ? 'bg-gradient-to-br from-cyan-600/80 to-blue-600/80 text-white border border-cyan-400/30 shadow-cyan-500/30'
                        : 'bg-slate-800/50 text-slate-200 border border-slate-600/30'
                    }`}
                  >
                    {msg.user !== userName && msg.user !== 'システム' && (
                      <p className="text-xs font-semibold mb-1 font-mono">
                        {msg.isAI ? '🤖 ' : '👤 '}
                        <span className={msg.isAI ? 'text-purple-300' : 'text-cyan-300'}>{msg.user}</span>
                      </p>
                    )}
                    <p className="break-words">{msg.text}</p>
                    <p className="text-xs opacity-50 mt-1 font-mono">
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

            {/* 入力エリア - 絶対配置で最下部に固定 */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-cyan-500/30 p-4 bg-gradient-to-r from-slate-900 to-blue-900 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  name="message-input-unique"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="メッセージを入力..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none text-white placeholder-cyan-300/30 backdrop-blur-sm font-mono"
                  style={{ backgroundImage: 'none !important' }}
                />
                <button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-cyan-500/30 border border-cyan-400/30 shrink-0"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-cyan-500/30 text-white p-4 flex flex-col shadow-2xl">
          <div className="mb-4 pb-3 border-b border-cyan-500/30">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">PARTICIPANTS</h2>
            <p className="text-xs text-cyan-400/60 mt-1 font-mono">{participants.length + 1} ACTIVE</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <span className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-sm shadow-lg shadow-cyan-500/50">
                👤
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-mono text-cyan-300 block truncate">{userName}</span>
                <span className="text-xs text-cyan-400/50">YOU</span>
              </div>
            </div>
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-lg ${
                  p.isAI ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/50' : 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/50'
                }`}>
                  {p.isAI ? '🤖' : '👤'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-mono text-slate-200 block truncate">{p.name}</span>
                  {p.isAI && <span className="text-xs text-purple-400/70">AI AGENT</span>}
                </div>
              </div>
            ))}
          </div>

          {/* コントロール */}
          <div className="mt-4 space-y-2 pt-4 border-t border-cyan-500/30">
            <button
              onClick={toggleMute}
              className={`w-full py-3 rounded-xl font-semibold transition border shadow-lg ${
                isMuted
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-400/30 shadow-red-500/30'
                  : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/30'
              }`}
            >
              {isMuted ? '🔇 ミュート中' : '🎤 ミュート'}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-full py-3 rounded-xl font-semibold transition border shadow-lg ${
                isVideoOn
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-400/30 shadow-blue-500/30'
                  : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/30'
              }`}
            >
              {isVideoOn ? '📹 ビデオON' : '📹 ビデオOFF'}
            </button>
            <button
              onClick={leaveRoom}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 py-3 rounded-xl font-semibold transition border border-red-400/30 shadow-lg shadow-red-500/30"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
