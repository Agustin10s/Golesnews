import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cms-auth';
import { categoryDb } from '@/lib/cms-db';

export async function GET() {
  const cats = categoryDb.list();
  return NextResponse.json({ categories: cats });
}

export async function POST(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json() as { slug?: string; label?: string; color?: string; ord?: number };
  if (!body.slug || !body.label) return NextResponse.json({ error: 'slug y label requeridos' }, { status: 400 });
  const id = categoryDb.create(body.slug, body.label, body.color ?? '#e8353a', body.ord ?? 0);
  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json() as { id?: number; slug?: string; label?: string; color?: string; ord?: number };
  if (!body.id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  categoryDb.update(body.id, { slug: body.slug, label: body.label, color: body.color, ord: body.ord });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  categoryDb.delete(id);
  return NextResponse.json({ ok: true });
}
