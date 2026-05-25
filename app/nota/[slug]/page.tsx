import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article  = articleDb.findBySlug(slug);
  if (!article || article.status !== 'published') return { title: 'Nota no encontrada — GolesNews' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://golesnews-production.up.railway.app';
  return {
    title:       article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    keywords:    article.seo_keywords,
    alternates:  { canonical: `${siteUrl}/nota/${article.slug}` },
    openGraph: {
      title:       article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      images:      article.featured_image ? [{ url: article.featured_image }] : [],
      type:        'article',
      publishedTime: article.published_at || article.created_at,
      siteName:    'GolesNews',
    },
    twitter: {
      card:        'summary_large_image',
      title:       article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      images:      article.featured_image ? [article.featured_image] : [],
    },
  };
}

export default async function NotaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article  = articleDb.findBySlug(slug);
  if (!article || article.status !== 'published') notFound();

  // Increment views (fire and forget)
  articleDb.incrementViews(article.id);

  const siteUrl      = process.env.NEXT_PUBLIC_SITE_URL || 'https://golesnews-production.up.railway.app';
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;
  const rt           = readTime(article.content);
  const date         = new Date(article.published_at || article.created_at).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  let tags: string[] = [];
  try { tags = JSON.parse(article.tags || '[]'); } catch { tags = []; }

  const jsonLd = {
    '@context':    'https://schema.org',
    '@type':       'NewsArticle',
    headline:      article.title,
    description:   article.excerpt,
    image:         article.featured_image ? [article.featured_image] : [],
    datePublished: article.published_at || article.created_at,
    dateModified:  article.updated_at,
    author:        { '@type': 'Organization', name: 'GolesNews', url: siteUrl },
    publisher:     { '@type': 'Organization', name: 'GolesNews', url: siteUrl },
    keywords:      article.seo_keywords,
    articleSection: categoryLabel,
    url:           `${siteUrl}/nota/${article.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 1rem 60px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Inicio</Link>
          <span>›</span>
          <span style={{ color: '#e8353a', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, fontWeight: 700 }}>{categoryLabel}</span>
        </nav>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: -1,
          color: '#fff',
          marginBottom: 14,
        }}>
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text2)', marginBottom: 20, borderLeft: '3px solid var(--red)', paddingLeft: 16 }}>
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text2)' }}>GolesNews</span>
          <span>📅 {date}</span>
          <span>⏱ {rt} min de lectura</span>
          {article.views > 0 && <span>👁 {article.views} vistas</span>}
          {article.source_name && (
            <span>
              Fuente: {article.source_url
                ? <a href={article.source_url} target="_blank" rel="nofollow noreferrer" style={{ color: 'var(--text3)' }}>{article.source_name}</a>
                : article.source_name}
            </span>
          )}
        </div>

        {/* Featured image */}
        {article.featured_image && (
          <div style={{ marginBottom: 28, borderRadius: 8, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.featured_image} alt={article.title}
              style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {/* Article body */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Tags:</span>
            {tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 2 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share buttons */}
        <div style={{ marginTop: 28, padding: '16px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Compartir:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${siteUrl}/nota/${article.slug}`)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#1da1f2', textDecoration: 'none', padding: '6px 16px', border: '1px solid rgba(29,161,242,.3)', borderRadius: 4 }}>
            𝕏 Twitter
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' → ' + siteUrl + '/nota/' + article.slug)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#25d366', textDecoration: 'none', padding: '6px 16px', border: '1px solid rgba(37,211,102,.3)', borderRadius: 4 }}>
            WhatsApp
          </a>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none' }}>← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}
