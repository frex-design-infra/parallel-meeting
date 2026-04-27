'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');

  const createRoom = () => {
    if (!roomName.trim() || !userName.trim()) {
      alert('ルーム名とユーザー名を入力してください');
      return;
    }

    const roomId = `room_${Date.now()}`;
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
  };

  const joinRoom = () => {
    if (!roomName.trim() || !userName.trim()) {
      alert('ルーム名とユーザー名を入力してください');
      return;
    }

    router.push(`/room/${roomName}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 電脳空間風背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        {/* グリッド線 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(60deg)',
          transformOrigin: 'center center'
        }} />

        {/* サークルエフェクト */}
        {[...Array(20)].map((_, i) => {
          const size = (i * 15 + 80) % 250 + 80;
          const top = (i * 19 + 15) % 100;
          const left = (i * 27 + 25) % 100;
          const delay = (i * 0.4) % 4;
          const duration = (i * 0.5) % 4 + 3;

          return (
            <div
              key={i}
              className="absolute border border-cyan-500/20 rounded-full animate-pulse"
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
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* 中央の大きなサークル */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[1000px] h-[1000px] border border-cyan-500/8 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-pink-500/8 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/12 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-purple-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-500/20 p-8 max-w-md w-full border border-cyan-500/30 relative z-10">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-pink-600 rounded-2xl blur-lg opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-500/50">
              <span className="text-5xl">🤖</span>
            </div>
            <div className="absolute -inset-2 border border-cyan-500/30 rounded-2xl animate-ping opacity-20" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-3 font-mono">AI Meeting Room</h1>
          <p className="text-transparent bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text font-mono text-sm">タチコマと一緒に会議しよう</p>
          <div className="mt-3 inline-block px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border border-pink-500/30 rounded-full">
            <p className="text-xs text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text font-mono">GHOST IN THE SHELL INSPIRED</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-cyan-300/80 mb-2 font-mono">
              YOUR NAME
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="例: 少佐"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none transition text-white placeholder-cyan-300/30 backdrop-blur-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-300/80 mb-2 font-mono">
              ROOM NAME
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="例: project-meeting"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none transition text-white placeholder-cyan-300/30 backdrop-blur-sm font-mono"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={createRoom}
              className="flex-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-pink-500/30 border border-pink-400/30 relative overflow-hidden group"
            >
              <span className="relative z-10">新規作成</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition" />
            </button>
            <button
              onClick={joinRoom}
              className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 hover:from-green-500 hover:via-emerald-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-green-500/30 border border-green-400/30 relative overflow-hidden group"
            >
              <span className="relative z-10">参加</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition" />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-cyan-500/30">
          <h2 className="text-sm font-semibold text-cyan-300/80 mb-3 font-mono">FEATURES</h2>
          <ul className="space-y-2 text-sm text-cyan-200/60 font-mono">
            <li className="flex items-center gap-2 group">
              <span className="text-cyan-400 group-hover:text-cyan-300 transition">▸</span>
              <span className="group-hover:text-cyan-300 transition">音声通話（WebRTC）</span>
            </li>
            <li className="flex items-center gap-2 group">
              <span className="text-cyan-400 group-hover:text-cyan-300 transition">▸</span>
              <span className="group-hover:text-cyan-300 transition">リアルタイム文字起こし</span>
            </li>
            <li className="flex items-center gap-2 group">
              <span className="text-cyan-400 group-hover:text-cyan-300 transition">▸</span>
              <span className="group-hover:text-cyan-300 transition">タチコマAIが会議に参加</span>
            </li>
            <li className="flex items-center gap-2 group">
              <span className="text-cyan-400 group-hover:text-cyan-300 transition">▸</span>
              <span className="group-hover:text-cyan-300 transition">テキストチャット</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
