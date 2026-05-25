'use client';
import { useEffect, useState, useCallback } from 'react';
import MatchCard from './MatchCard';
import NewsCard from './NewsCard';
import SectionHeader from './SectionHeader';
import StandingsWidget from './StandingsWidget';
import ScorersWidget from './ScorersWidget';

interface Article {
  id: string; title: string; slug: string; excerpt?: string;
  featured_image?: string; category: string; category_label: string;
  published_at?: string; author_name?: string; read_time?: number;
}

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; round?: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

export default function HomeContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
  const [todayFixtures, setTodayFixtures] = useState<Fixture[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const loadData = useCallback(() => {
    // News
    fetch('/api/news?per_page=12')
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setLoadingNews(false); })
      .catch(() => setLoadingNews(false));

    // Live
    fetch('/api/football/live')
      .then(r => r.json())
      .then(d => setLiveFixtures(d.fixtures || []))
      .catch(() => {});

    // Today
    fetch('/api/football/fixtures?section=all-today')
      .then(r => r.json())
      .then(d => setTodayFixtures(d.fixtures || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetch('/api/football/live')
        .then(r => r.json())
        .then(d => setLiveFixtures(d.fixtures || []))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const hero = articles[0];
  const heroSides = articles.slice(1, 3);
  const grid3 = articles.slice(3, 6);
  const listArticles = articles.slice(6, 12);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, padding: '18px 0' }}>
        {/* MAIN COLUMN */}
        <div style={{ minWidth: 0 }}>

          {/* HERO */}
          {!loadingNews && articles.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, marginBottom: 18, minHeight: 400 }}>
              {hero && (
                <a href={`/nota/${hero.slug}`} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', gridRow: '1/3', minHeight: 400, display: 'block', textDecoration: 'none' }}>
                  {hero.featured_image ? (
                    <img src={hero.featured_image} alt={hero.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a0a,#2d1010)' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.93) 0%,rgba(0,0,0,.2) 55%,transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: 6 }}>{hero.category_label}</span>
                    <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(20px,2.5vw,34px)', fontWeight: 800, lineHeight: 1.1, color: '#fff', marginBottom: 6 }}>{hero.title}</h1>
                    {hero.excerpt && <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.5, maxWidth: 440 }}>{hero.excerpt.slice(0,120)}</p>}
                  </div>
                </a>
              )}
              {heroSides.map(a => (
                <a key={a.id} href={`/nota/${a.slug}`} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'block', textDecoration: 'none' }}>
                  {a.featured_image ? (
                    <img src={a.featured_image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0a1a0a,#102d10)' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 65%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '.9rem' }}>
                    <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>{a.title}</h2>
                  </div>
                </a>
              ))}
            </div>
          )}

          {loadingNews && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, marginBottom: 18, height: 400 }}>
              <div className="skeleton" style={{ gridRow: '1/3' }} />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          )}

          {/* LIVE MATCHES */}
          {liveFixtures.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="En Vivo" badge="LIVE" action={{ label: 'Ver todos', href: '/en-vivo' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
                {liveFixtures.slice(0, 6).map(f => (
                  <MatchCard key={f.fixture.id} fixture={f} />
                ))}
              </div>
            </div>
          )}

          {/* TODAY FIXTURES */}
          {todayFixtures.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Partidos de Hoy" action={{ label: 'Fixture completo', href: '/fixture' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
                {todayFixtures.slice(0, 6).map(f => (
                  <MatchCard key={f.fixture.id} fixture={f} />
                ))}
              </div>
            </div>
          )}

          {/* NEWS GRID 3 */}
          {grid3.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeader title="Últimas Noticias" action={{ label: 'Ver todas', href: '/?todas=1' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {grid3.map(a => <NewsCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

          {/* MORE NEWS LIST */}
          {listArticles.length > 0 && (
            <div>
              <SectionHeader title="Más Noticias" />
              {listArticles.map(a => <NewsCard key={a.id} article={a} variant="list" />)}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ minWidth: 0 }}>
          <StandingsWidget />
          <div style={{ marginTop: 14 }}>
            <ScorersWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
