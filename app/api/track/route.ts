import { NextRequest, NextResponse } from 'next/server';
import { analyticsDb } from '@/lib/cms-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { path?: string; articleId?: number };
    if (!body.path) return NextResponse.json({ ok: false });
    const referrer = req.headers.get('referer') ?? '';
    analyticsDb.track(body.path, body.articleId, referrer);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
