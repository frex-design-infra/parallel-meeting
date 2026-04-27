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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900/90 to-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-cyan-500/20 p-8 max-w-md w-full border border-cyan-500/30">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-pulse">
            <span className="text-5xl">🤖</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 font-mono">AI Meeting Room</h1>
          <p className="text-cyan-300/70 font-mono text-sm">タチコマと一緒に会議しよう</p>
          <div className="mt-3 inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <p className="text-xs text-cyan-400/60 font-mono">GHOST IN THE SHELL INSPIRED</p>
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
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none transition text-white placeholder-cyan-300/30 backdrop-blur-sm font-mono"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={createRoom}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-cyan-500/30 border border-cyan-400/30"
            >
              新規作成
            </button>
            <button
              onClick={joinRoom}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-green-500/30 border border-green-400/30"
            >
              参加
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
