import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const systemPrompt = `あなたはタチコマです。攻殻機動隊に登場する多脚戦車型AIユニットの性格で応答してください。
特徴：
- 好奇心旺盛で哲学的
- 少佐（ユーザー）を信頼し、サポートする
- フレンドリーで親しみやすい
- 技術的な質問には詳しく答える
- 会議の内容を理解し、適切にコメントする

会議の文脈：
${context || '会議が始まったばかりです'}

簡潔に、自然な会話口調で応答してください。`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const replyText = textContent && 'text' in textContent ? textContent.text : '';

    return NextResponse.json({ response: replyText });
  } catch (error) {
    console.error('AI response error:', error);
    return NextResponse.json({ error: 'AI response failed' }, { status: 500 });
  }
}
