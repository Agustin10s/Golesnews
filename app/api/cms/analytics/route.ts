import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/cms-auth';
import { analyticsDb, articleDb } from '@/lib/cms-db';

export async function GET(req: NextRequest) {
  const auth = await getSession();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const days = Number(searchParams.get('days') ?? 30);

  const [totalViews, viewsByDay, topPages, topArticles, viewsByCategory] = await Promise.all([
    analyticsDb.totalViews(days),
    analyticsDb.viewsByDay(days),
    analyticsDb.topPages(10),
    analyticsDb.topArticles(10),
    analyticsDb.viewsByCategory(),
  ]);

  const totalPublished = articleDb.count({ status: 'published' });
  const totalDrafts    = articleDb.count({ status: 'draft' });
  const totalArticles  = articleDb.count();

  return NextResponse.json({
    totalViews,
    viewsByDay,
    topPages,
    topArticles,
    viewsByCategory,
    articles: { total: totalArticles, published: totalPublished, drafts: totalDrafts },
  });
}
