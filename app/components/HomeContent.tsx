'use client';
import { useEffect, useState, useCallback } from 'react';
import MatchCard from './MatchCard';
import NewsCard from './NewsCard';
import SectionHeader from './SectionHeader';
import AdSlot, { PopupAd, StickyBottomAd } from './AdSlot';

interface Article {
  id: string; title: string; slug: string; excerpt?: string;
  featured_image?: string; category: string; category_label: string;
  published_at?: string; author_name?: string; read_time?: number;
  section?: string; subcategory?: string;
}

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; round?: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

function CategoryTag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
      color: color ?? 'var(--red)', display: 'inline-block', marginBottom: 4,
    }}>
      {label}
    </span>
  );
}

export default function HomeContent() {
  const [articles,      setArticles]      = useState<Article[]>([]);
  const [liveFixtures,  setLiveFixtures]  = useState<Fixture[]>([]);
  const [todayFixtures, setTodayFixtures] = useState<Fixture[]>([]);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [loadingNews,   setLoadingNews]   = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const PER_PAGE = 18;

  const loadNews = useCallback((p: number, append = false) => {
    if (!append) setLoadingNews(true); else setLoadingMore(true);
    fetch(`/api/news?per_page=${PER_PAGE}&page=${p}`)
      .then(r => r.json())
      .then((d: { articles?: Article[]; total?: number }) => {
        const arts = d.articles || [];
        setArticles(prev => append ? [...prev, ...arts] : arts);
        setHasMore((d.total ?? 0) > p * PER_PAGE);
        setLoadingNews(false); setLoadingMore(false);
      })
      .catch(() => { setLoadingNews(false); setLoadingMore(false); });
  }, []);

  useEffect(() => {
    loadNews(1);
    fetch('/api/football/live').then(r => r.json()).then(d => setLiveFixtures(d.fixtures || [])).catch(() => {});
    fetch('/api/football/fixtures?section=all-today').then(r => r.json()).then(d => setTodayFixtures(d.fixtures || [])).catch(() => {});

    const interval = setInterval(() => {
      fetch('/api/football/live').then(r => r.json()).then(d => setLiveFixtures(d.fixtures || [])).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [loadNews]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadNews(next, true);
  }

  // ── Layout: section-aware placement ─────────────────────
  // Articles with an explicit section go to that section first;
  // remaining "auto" articles fill leftover slots in date order.
  const bySection = (s: string) => articles.filter(a => a.section === s);
  const pinned = new Set(articles.filter(a => a.section).map(a => a.id));
  const auto   = articles.filter(a => !pinned.has(a.id));

  const heroPool     = [...bySection('inicio'),    ...auto];
  const destacadoPool= [...bySection('destacado'), ...auto.filter(a => a.id !== heroPool[0]?.id)];
  const ultimasPool  = [...bySection('ultimas'),   ...auto.filter(a => !destacadoPool.slice(0,4).map(x=>x.id).includes(a.id) && a.id !== heroPool[0]?.id)];
  const mundoPool    = [...bySection('mundo'),     ...auto.filter(a => ![heroPool[0]?.id, ...destacadoPool.slice(0,4).map(x=>x.id), ...ultimasPool.slice(0,3).map(x=>x.id)].includes(a.id))];
  const otrasPool    = [...bySection('otras'),     ...auto.filter(a => ![heroPool[0]?.id, ...destacadoPool.slice(0,4).map(x=>x.id), ...ultimasPool.slice(0,3).map(x=>x.id), ...mundoPool.slice(0,4).map(x=>x.id)].includes(a.id))];

  const hero      = heroPool[0];
  const heroSides = heroPool.slice(1, 3);
  const featured  = destacadoPool.slice(0, 4);
  const block2    = ultimasPool.slice(0, 3);
  const block3    = mundoPool.slice(0, 4);
  const rest      = otrasPool;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 1rem' }}>
      <PopupAd />
      <StickyBottomAd />

      {/* Header banner ad */}
      <AdSlot placement="header-banner" style={{ margin: '12px 0', minHeight: 0 }} />


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, paddingTop: 16 }}>
        {/* ── MAIN COLUMN ──────────────────────────────── */}
        <div style={{ minWidth: 0 }}>

          {/* HERO — big card + 2 side cards */}
          {!loadingNews && articles.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, marginBottom: 20, minHeight: 440 }}>
              {hero && (
                <a href={`/nota/${hero.slug}`} style={{ position: 'relative', overflow: 'hidden', gridRow: '1/3', display: 'block', textDecoration: 'none', minHeight: 440 }}>
                  {hero.featured_image
                    ? <img src={hero.featured_image} alt={hero.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#111', minHeight: 440 }} />
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.25) 50%,transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.4rem' }}>
                    <CategoryTag label={hero.category_label} />
                    <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(22px,2.8vw,38px)', fontWeight: 800, lineHeight: 1.05, color: '#fff', marginBottom: 7 }}>{hero.title}</h1>
                    {hero.excerpt && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.5, maxWidth: 420 }}>{hero.excerpt.slice(0, 120)}</p>}
                  </div>
                </a>
              )}
              {heroSides.map(a => (
                <a key={a.id} href={`/nota/${a.slug}`} style={{ position: 'relative', overflow: 'hidden', display: 'block', textDecoration: 'none' }}>
                  {a.featured_image
                    ? <img src={a.featured_image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#0f0f0f' }} />
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 65%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '.85rem' }}>
                    <CategoryTag label={a.category_label} />
                    <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, lineHeight: 1.2, color: '#fff', margin: 0 }}>{a.title}</h2>
                  </div>
                </a>
              ))}
            </div>
          )}

          {loadingNews && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, marginBottom: 20, height: 440 }}>
              <div className="skeleton" style={{ gridRow: '1/3', borderRadius: 0 }} />
              <div className="skeleton" style={{ borderRadius: 0 }} />
              <div className="skeleton" style={{ borderRadius: 0 }} />
            </div>
          )}

          {/* LIVE MATCHES */}
          {liveFixtures.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="En Vivo" badge="LIVE" action={{ label: 'Ver todos', href: '/en-vivo' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
                {liveFixtures.slice(0, 4).map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
              </div>
            </div>
          )}

          {/* FEATURED ROW (4 cards) */}
          {featured.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Destacado" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                {featured.map(a => <NewsCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

          {/* TODAY FIXTURES */}
          {todayFixtures.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Partidos de Hoy" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
                {todayFixtures.slice(0, 4).map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
              </div>
            </div>
          )}

          {/* BLOCK 2 — list style */}
          {block2.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Últimas Noticias" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {block2.map(a => <NewsCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

          {/* In-article ad */}
          <AdSlot placement="in-article" style={{ margin: '16px 0' }} />

          {/* BLOCK 3 — 4 columns */}
          {block3.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Más del Mundo" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                {block3.map(a => <NewsCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

          {/* REST — list rows */}
          {rest.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title="Otras Noticias" />
              {rest.map(a => <NewsCard key={a.id} article={a} variant="list" />)}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button onClick={loadMore} disabled={loadingMore}
                style={{ padding: '11px 28px', background: '#111', border: '1px solid #2a2a2a', color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: .5, cursor: 'pointer', borderRadius: 4 }}>
                {loadingMore ? 'Cargando...' : 'Ver más noticias'}
              </button>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ──────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>
          <AdSlot placement="sidebar-top" style={{ marginBottom: 16 }} />

          {/* Most read / latest — simple list */}
          {articles.slice(3, 10).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--red)' }}>
                Lo más leído
              </div>
              {articles.slice(3, 10).map((a, i) => (
                <a key={a.id} href={`/nota/${a.slug}`} style={{ display: 'flex', gap: 10, marginBottom: 12, textDecoration: 'none', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#1e1e1e', flexShrink: 0, lineHeight: 1, minWidth: 28 }}>
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--red)', marginBottom: 3 }}>{a.category_label}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {a.title}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <AdSlot placement="sidebar-mid" style={{ marginBottom: 16 }} />

          {/* Category pills */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '14px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid var(--red)' }}>
              Secciones
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                { href: '/liga-argentina', label: 'Argentina' },
                { href: '/sudamerica',     label: 'Sudamérica' },
                { href: '/europa',         label: 'Europa' },
                { href: '/americas',       label: 'MLS' },
                { href: '/mundial-2026',   label: 'Mundial 2026' },
                { href: '/tablas',         label: 'Tablas' },
              ].map(s => (
                <a key={s.href} href={s.href} style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase',
                  padding: '5px 10px', background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text3)', textDecoration: 'none', borderRadius: 2,
                }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
