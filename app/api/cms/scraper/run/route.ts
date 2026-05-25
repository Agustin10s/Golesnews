import { NextRequest, NextResponse } from 'next/server';
import { scraperDb, articleDb, uniqueSlug } from '@/lib/cms-db';
import { fetchRssFeed, fetchArticleContent } from '@/lib/cms-scraper';
import { rewriteArticle, optimizeSeo } from '@/lib/cms-ai';
import { getSession } from '@/lib/cms-auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => ({})) as { source_id?: number };

  const sources = scraperDb.list().filter(s =>
    s.enabled && (body.source_id == null || s.id === body.source_id),
  );

  const results: { source: string; added: number; errors: string[] }[] = [];

  for (const source of sources) {
    const added: number[] = [];
    const errors: string[] = [];

    try {
      const items = await fetchRssFeed(source.rss_url, 6);
      for (const item of items) {
        // Skip if already exists (by source URL)
        const existing = articleDb.list({ status: undefined }).find(
          a => a.source_url === item.link,
        );
        if (existing) continue;

        try {
          // Get full content from article page if description is short
          let rawContent = item.description;
          if (rawContent.length < 300 && item.link) {
            const full = await fetchArticleContent(item.link);
            if (full.length > rawContent.length) rawContent = full;
          }

          // Rewrite with AI (requires ANTHROPIC_API_KEY)
          let title = item.title;
          let content = `<p>${rawContent.replace(/\n\n+/g, '</p><p>').replace(/\n/g, ' ')}</p>`;
          let excerpt = rawContent.slice(0, 160);

          try {
            const rewritten = await rewriteArticle(item.title, rawContent, source.source_name);
            title = rewritten.title;
            content = rewritten.content;
            excerpt = rewritten.excerpt;
          } catch {
            // No AI key — use original content
          }

          // SEO optimization
          let seoTitle = title.slice(0, 60);
          let seoDesc = excerpt;
          let seoKw = source.category;

          try {
            const seo = await optimizeSeo(title, content, source.category);
            seoTitle = seo.seo_title;
            seoDesc = seo.seo_description;
            seoKw = seo.seo_keywords;
          } catch { /* no AI */ }

          const slug = uniqueSlug(title);
          const status = source.auto_publish ? 'published' : 'draft';

          const id = articleDb.create({
            title, slug, excerpt, content,
            category: source.category,
            tags: [source.category, source.source_name.toLowerCase()],
            status,
            featured_image: item.image || '',
            author_id: session ? parseInt(session.sub) : undefined,
            seo_title: seoTitle, seo_description: seoDesc, seo_keywords: seoKw,
            source_url: item.link, source_name: source.source_name,
          });
          added.push(id);
        } catch (e) {
          errors.push(`${item.title}: ${String(e)}`);
        }
      }

      scraperDb.incrementCount(source.id, added.length);
      results.push({ source: source.source_name, added: added.length, errors });
    } catch (e) {
      results.push({ source: source.source_name, added: 0, errors: [String(e)] });
    }
  }

  const totalAdded = results.reduce((s, r) => s + r.added, 0);
  return NextResponse.json({ ok: true, totalAdded, results });
}
