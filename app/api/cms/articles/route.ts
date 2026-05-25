import { NextRequest, NextResponse } from 'next/server';
import { articleDb, uniqueSlug } from '@/lib/cms-db';
import { getSession } from '@/lib/cms-auth';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status   = searchParams.get('status') || undefined;
  const category = searchParams.get('category') || undefined;
  const limit    = parseInt(searchParams.get('limit') || '50');
  const offset   = parseInt(searchParams.get('offset') || '0');

  const articles = articleDb.list({ status, category, limit, offset });
  const total    = articleDb.count({ status, category });
  return NextResponse.json({ articles, total });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json();
  const { title, content, category, excerpt, tags, status, featured_image,
          seo_title, seo_description, seo_keywords, source_url, source_name } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 });
  }

  const slug = uniqueSlug(body.slug || title);
  const id = articleDb.create({
    title, slug, excerpt: excerpt || '', content, category: category || 'futbol',
    tags: tags || [], status: status || 'draft',
    featured_image: featured_image || '',
    author_id: session ? parseInt(session.sub) : undefined,
    seo_title: seo_title || '', seo_description: seo_description || '',
    seo_keywords: seo_keywords || '',
    source_url: source_url || '', source_name: source_name || '',
  });
  return NextResponse.json({ id, slug }, { status: 201 });
}
