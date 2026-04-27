import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  // 環境変数チェック：未設定の場合は未実装メッセージを返す
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: 'Transcription feature not configured',
        message: 'OPENAI_API_KEY environment variable is not set. This feature will be implemented later.'
      },
      { status: 501 } // 501 Not Implemented
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ja',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
