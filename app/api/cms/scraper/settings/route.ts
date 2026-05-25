import { NextRequest, NextResponse } from 'next/server';
import { scraperDb } from '@/lib/cms-db';

export async function GET() {
  return NextResponse.json({ settings: scraperDb.list() });
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as { id: number; enabled?: number; auto_publish?: number; category?: string; rss_url?: string };
  scraperDb.update(body.id, {
    enabled: body.enabled, auto_publish: body.auto_publish,
    category: body.category, rss_url: body.rss_url,
  });
  return NextResponse.json({ ok: true });
}
