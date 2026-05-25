import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cms-auth';
import { adDb } from '@/lib/cms-db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get('placement') ?? undefined;
  const activeOnly = searchParams.get('active') === '1';
  const ads = activeOnly ? adDb.listActive(placement) : adDb.list();
  return NextResponse.json({ ads });
}

export async function POST(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json() as {
    name?: string; placement?: string; type?: string;
    content?: string; link_url?: string; enabled?: number;
  };
  if (!body.name || !body.placement) return NextResponse.json({ error: 'name y placement requeridos' }, { status: 400 });
  const id = adDb.create({
    name: body.name, placement: body.placement,
    type: body.type ?? 'image', content: body.content ?? '',
    link_url: body.link_url ?? '', enabled: body.enabled ?? 1,
    impressions: 0, clicks: 0,
  });
  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json() as {
    id?: number; name?: string; placement?: string; type?: string;
    content?: string; link_url?: string; enabled?: number;
    action?: 'impression' | 'click';
  };
  if (!body.id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  if (body.action === 'impression') { adDb.trackImpression(body.id); return NextResponse.json({ ok: true }); }
  if (body.action === 'click') { adDb.trackClick(body.id); return NextResponse.json({ ok: true }); }
  adDb.update(body.id, {
    name: body.name, placement: body.placement, type: body.type,
    content: body.content, link_url: body.link_url, enabled: body.enabled,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  adDb.delete(id);
  return NextResponse.json({ ok: true });
}
