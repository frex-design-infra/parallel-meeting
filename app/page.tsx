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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🤖 AI Meeting Room</h1>
          <p className="text-gray-600">タチコマと一緒に会議しよう</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              あなたの名前
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="例: 少佐"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ルーム名
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="例: project-meeting"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={createRoom}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              新規作成
            </button>
            <button
              onClick={joinRoom}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              参加
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">機能</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              音声通話（WebRTC）
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              リアルタイム文字起こし
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              タチコマAIが会議に参加
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              テキストチャット
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
