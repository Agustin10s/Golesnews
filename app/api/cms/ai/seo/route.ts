import { NextRequest, NextResponse } from 'next/server';
import { optimizeSeo } from '@/lib/cms-ai';

export async function POST(req: NextRequest) {
  try {
    const { title, content, category } = await req.json() as {
      title: string; content: string; category?: string;
    };
    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 });
    }
    const result = await optimizeSeo(title, content, category || 'futbol');
    return NextResponse.json(result);
  } catch (e) {
    const msg = String(e);
    if (msg.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: 'Configurá ANTHROPIC_API_KEY en Railway para usar IA' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
