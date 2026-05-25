import { NextRequest, NextResponse } from 'next/server';
import { rewriteArticle } from '@/lib/cms-ai';

export async function POST(req: NextRequest) {
  try {
    const { title, content, source_name } = await req.json() as {
      title: string; content: string; source_name?: string;
    };
    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 });
    }
    const result = await rewriteArticle(title, content, source_name || 'fuente externa');
    return NextResponse.json(result);
  } catch (e) {
    const msg = String(e);
    if (msg.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: 'Configurá ANTHROPIC_API_KEY en Railway para usar IA' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
