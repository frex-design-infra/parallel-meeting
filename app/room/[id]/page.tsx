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

  // 電脳空間用のスタイル
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px);
        background-size: 50px 50px;
        transform: perspective(1000px) rotateX(60deg);
        transform-origin: center center;
        z-index: 1;
      }

      @keyframes cyber-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }

      .cyber-circle {
        animation: cyber-pulse 3s ease-in-out infinite;
      }

      @keyframes cyber-spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }

      @keyframes cyber-spin-reverse {
        from { transform: translate(-50%, -50%) rotate(360deg); }
        to { transform: translate(-50%, -50%) rotate(0deg); }
      }

      .cyber-spin-slow {
        animation: cyber-spin 30s linear infinite;
      }

      .cyber-spin-fast {
        animation: cyber-spin-reverse 20s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const dailyRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

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

    // タチコマAIに応答をリクエスト
    socketRef.current.emit('request-ai-response', { roomId, message: inputText });

    // 入力欄をクリア
    setInputText('');
    if (inputRef.current) {
      inputRef.current.textContent = '';
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    setInputText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
    <div className="h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col overflow-hidden relative">
      {/* 電脳空間風背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        {/* グリッド線 */}
        <div className="grid" />

        {/* サークルエフェクト */}
        {[...Array(15)].map((_, i) => {
          const size = (i * 13 + 50) % 200 + 50;
          const top = (i * 17 + 10) % 100;
          const left = (i * 23 + 20) % 100;
          const delay = (i * 0.3) % 3;
          const duration = (i * 0.4) % 3 + 2;

          return (
            <div
              key={i}
              className="absolute border-2 border-cyan-400/40 rounded-full cyber-circle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`
              }}
            />
          );
        })}

        {/* 光の線 */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* 中央の大きなサークル */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] border-2 border-cyan-400/30 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-2 border-pink-400/30 rounded-full cyber-spin-slow" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border-2 border-cyan-400/40 rounded-full cyber-spin-fast" />
        </div>
      </div>

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-slate-900/90 via-indigo-900/80 to-purple-900/90 backdrop-blur-sm border-b border-cyan-500/30 text-white p-4 flex justify-between items-center shadow-lg shadow-pink-500/10 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-lg blur opacity-50 animate-pulse" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <span className="text-xl">🤖</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">AI Meeting Room</h1>
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
          <div className="bg-gradient-to-br from-slate-900 via-indigo-900/50 to-purple-900/50 p-4 h-64 border-b border-pink-500/20 shrink-0 relative">
            <div className="w-full h-full bg-gradient-to-br from-slate-800/50 to-purple-900/30 rounded-xl border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm shadow-inner relative overflow-hidden">
              {/* ホログラム風エフェクト */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-cyan-400/30 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-pink-400/30 rounded-full animate-pulse" />
              </div>
              <div className="text-center relative z-10">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full blur-md animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-cyan-500/50 shadow-lg shadow-cyan-500/30">
                    <span className="text-4xl">🎙️</span>
                  </div>
                </div>
                <p className="text-transparent bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text font-mono text-sm font-bold">VOICE COMMUNICATION</p>
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
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl backdrop-blur-sm shadow-lg relative ${
                      msg.isAI
                        ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/60 border border-purple-400/50 shadow-purple-500/30'
                        : msg.user === 'システム'
                        ? 'bg-slate-800/30 border border-cyan-500/20 text-cyan-300/60 text-sm'
                        : msg.user === userName
                        ? 'bg-gradient-to-br from-cyan-600/80 via-blue-600/80 to-purple-600/60 text-white border border-cyan-400/30 shadow-cyan-500/30'
                        : 'bg-slate-800/50 text-slate-200 border border-slate-600/30'
                    }`}
                  >
                    {msg.isAI && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm -z-10" />
                    )}
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
            <div className="absolute bottom-0 left-0 right-0 border-t border-pink-500/30 p-4 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 backdrop-blur-md shadow-lg shadow-pink-500/10">
              <div className="flex gap-2 items-center">
                {/* 左側アイコン（Nアイコンがここに表示される） */}
                <div className="w-12 h-12 shrink-0" />

                {/* 入力欄 */}
                <div
                  ref={inputRef}
                  contentEditable
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  suppressContentEditableWarning
                  data-placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none text-white backdrop-blur-sm font-mono min-h-[48px] max-h-[120px] overflow-y-auto"
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />

                {/* 送信ボタン */}
                <button
                  onClick={sendMessage}
                  className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-pink-500/30 border border-pink-400/30 shrink-0 overflow-hidden group h-12"
                >
                  <span className="relative z-10">送信</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="w-72 bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950 border-l border-cyan-500/30 text-white p-4 flex flex-col shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
          <div className="mb-4 pb-3 border-b border-cyan-500/30 relative z-10">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent font-mono">PARTICIPANTS</h2>
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
              <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-600/30 backdrop-blur-sm relative">
                {p.isAI && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl" />}
                <div className="relative">
                  {p.isAI && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-50 animate-pulse" />}
                  <span className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-lg ${
                    p.isAI ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/50' : 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/50'
                  }`}>
                    {p.isAI ? '🤖' : '👤'}
                  </span>
                </div>
                <div className="flex-1 min-w-0 relative">
                  <span className="text-sm font-mono text-slate-200 block truncate">{p.name}</span>
                  {p.isAI && <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI AGENT</span>}
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
