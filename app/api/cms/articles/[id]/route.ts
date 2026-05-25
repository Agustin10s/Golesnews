import { NextRequest, NextResponse } from 'next/server';
import { articleDb } from '@/lib/cms-db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = articleDb.findById(parseInt(id));
  if (!article) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  articleDb.update(parseInt(id), {
    title: body.title, slug: body.slug, excerpt: body.excerpt,
    content: body.content, category: body.category,
    tags: body.tags, status: body.status,
    featured_image: body.featured_image,
    seo_title: body.seo_title, seo_description: body.seo_description,
    seo_keywords: body.seo_keywords,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  articleDb.delete(parseInt(id));
  return NextResponse.json({ ok: true });
}
