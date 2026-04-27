# AI Meeting Room

音声＋テキストで参加できるAI会議システム

## 機能

- 音声通話（WebRTC）
- リアルタイム文字起こし（Whisper API）
- テキストチャット
- 複数のタチコマAIが参加・応答
- 自動議事録生成

## 技術スタック

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Real-time:** Socket.io
- **Voice:** Daily.co API
- **Speech-to-Text:** OpenAI Whisper API
- **AI:** Claude API (Anthropic)
- **Database:** Supabase

## セットアップ

1. 依存パッケージインストール
```bash
npm install
```

2. 環境変数設定（`.env.local`）
```
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
DAILY_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

3. 開発サーバー起動
```bash
npm run dev
```

## 開発ロードマップ

### Phase 1: 基本機能（プロトタイプ）
- [x] プロジェクト初期化
- [ ] 会議ルーム作成UI
- [ ] 音声通話機能（Daily.co統合）
- [ ] テキストチャット機能
- [ ] 音声→テキスト変換
- [ ] タチコマ1体の応答機能

### Phase 2: 拡張機能
- [ ] 複数タチコマ（役割分担）
- [ ] 議事録自動生成
- [ ] 招待リンク機能
- [ ] 会議履歴保存

### Phase 3: 本番運用
- [ ] 認証機能
- [ ] 料金管理
- [ ] パフォーマンス最適化
