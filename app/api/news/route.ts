import { NextRequest, NextResponse } from 'next/server';
import { articleDb } from '@/lib/cms-db';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  futbol:        'Fútbol',
  argentina:     'Argentina',
  internacional: 'Internacional',
  champions:     'Champions League',
  libertadores:  'Copa Libertadores',
  mls:           'MLS',
  editorial:     'Editorial',
  transfers:     'Transferencias',
  lesiones:      'Lesiones',
};

function readTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page     = Math.max(1, parseInt(searchParams.get('page')     || '1'));
    const per_page = Math.min(50, parseInt(searchParams.get('per_page') || '12'));
    const category = searchParams.get('category') || undefined;
    const slug     = searchParams.get('slug')     || undefined;

    // Single article by slug
    if (slug) {
      const article = articleDb.findBySlug(slug);
      if (!article || article.status !== 'published') {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
      }
      articleDb.incrementViews(article.id);
      return NextResponse.json({
        article: {
          ...article,
          tags:           JSON.parse(article.tags || '[]'),
          category_label: CATEGORY_LABELS[article.category] || article.category,
          read_time:      readTime(article.content),
        },
      });
    }

    const offset = (page - 1) * per_page;
    const rows   = articleDb.list({ status: 'published', category, limit: per_page, offset });
    const total  = articleDb.count({ status: 'published', category });

    const articles = rows.map(a => ({
      id:             String(a.id),
      title:          a.title,
      slug:           a.slug,
      excerpt:        a.excerpt,
      featured_image: a.featured_image || null,
      category:       a.category,
      category_label: CATEGORY_LABELS[a.category] || a.category,
      published_at:   a.published_at || a.created_at,
      author_name:    (a as typeof a & { author_name?: string }).author_name || 'GolesNews',
      read_time:      readTime(a.content),
      source_name:    a.source_name || null,
    }));

    return NextResponse.json({
      articles,
      total,
      page,
      pages: Math.ceil(total / per_page),
    });
  } catch (e) {
    console.error('News API error:', e);
    return NextResponse.json({ articles: [], total: 0, page: 1, pages: 0 });
  }
}
