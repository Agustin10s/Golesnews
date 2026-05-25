'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats { total: number; published: number; draft: number; views: number; }
interface Article { id: number; title: string; status: string; category: string; created_at: string; views: number; }

const QUICK_ACTIONS = [
  {
    href: '/cms/articles/new',
    label: 'Redactar nota',
    desc: 'Crear artículo manual',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
  {
    href: '/cms/autopublish',
    label: 'Auto IA',
    desc: 'Scraper + reescritura automática',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  },
  {
    href: '/cms/media',
    label: 'Archivos',
    desc: 'Gestión de imágenes y archivos',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
  },
  {
    href: '/cms/analytics',
    label: 'Analytics',
    desc: 'Métricas de audiencia',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  },
  {
    href: '/cms/categories',
    label: 'Categorías',
    desc: 'Gestión de categorías',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
  },
  {
    href: '/cms/ads',
    label: 'Publicidad',
    desc: 'Avisos y banners del sitio',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/><path d="M7 12h10"/></svg>,
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, views: 0 });
  const [recent, setRecent] = useState<Article[]>([]);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/cms/auth/me').then(r => r.json()).then((d: { user?: { name: string; role: string } }) => { if (d.user) setUser(d.user); }).catch(() => {});
    fetch('/api/cms/articles?limit=6').then(r => r.json()).then((d: { articles?: Article[]; total?: number }) => {
      setRecent(d.articles || []);
      setStats(prev => ({ ...prev, total: d.total || 0 }));
    }).catch(() => {});
    fetch('/api/cms/articles?status=published&limit=1').then(r => r.json()).then((d: { total?: number }) => {
      setStats(prev => ({ ...prev, published: d.total || 0 }));
    }).catch(() => {});
    fetch('/api/cms/articles?status=draft&limit=1').then(r => r.json()).then((d: { total?: number }) => {
      setStats(prev => ({ ...prev, draft: d.total || 0 }));
    }).catch(() => {});
    fetch('/api/cms/analytics?days=30').then(r => r.json()).then((d: { totalViews?: number }) => {
      if (d.totalViews) setStats(prev => ({ ...prev, views: d.totalViews! }));
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 34, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -.5 }}>Dashboard</h1>
          {user && <p style={{ fontSize: 12, color: '#444', margin: '4px 0 0' }}>
            Sesión activa: <span style={{ color: '#666' }}>{user.name}</span>
            <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555', borderRadius: 3 }}>{user.role}</span>
          </p>}
        </div>
        <Link href="/cms/articles/new" style={{
          background: '#e8353a', color: '#fff', padding: '10px 18px', borderRadius: 4,
          fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: .5,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nueva nota
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Total artículos', value: stats.total, color: '#fff' },
          { label: 'Publicados',      value: stats.published, color: '#4ade80' },
          { label: 'Borradores',      value: stats.draft,     color: '#facc15' },
          { label: 'Vistas (30d)',    value: stats.views,     color: '#e8353a' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 5, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#333', marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 38, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#333', marginBottom: 12 }}>Acceso rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} href={a.href} style={{
              background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 5,
              padding: '16px', textDecoration: 'none', transition: 'border-color .12s',
              display: 'block',
            }}>
              <div style={{ color: '#e8353a', marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: '#444' }}>{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent articles */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#333', marginBottom: 12 }}>Artículos recientes</div>
        <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#888' }}>Últimas notas</span>
            <Link href="/cms/articles" style={{ fontSize: 11, color: '#e8353a', textDecoration: 'none' }}>Ver todas</Link>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#333', fontSize: 13 }}>
              No hay artículos. <Link href="/cms/articles/new" style={{ color: '#e8353a', textDecoration: 'none' }}>Crear uno</Link>
            </div>
          ) : recent.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 18px', borderBottom: '1px solid #0f0f0f' }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                padding: '3px 7px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0,
                background: a.status === 'published' ? 'rgba(74,222,128,.08)' : 'rgba(250,204,21,.08)',
                color: a.status === 'published' ? '#4ade80' : '#facc15',
                border: `1px solid ${a.status === 'published' ? 'rgba(74,222,128,.2)' : 'rgba(250,204,21,.2)'}`,
              }}>
                {a.status === 'published' ? 'Pub.' : 'Draft'}
              </span>
              <Link href={`/cms/articles/${a.id}/edit`} style={{ flex: 1, fontSize: 13, color: '#d0d0d0', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.title}
              </Link>
              <span style={{ fontSize: 10, color: '#333', whiteSpace: 'nowrap', background: '#111', border: '1px solid #1a1a1a', padding: '2px 7px', borderRadius: 3 }}>{a.category}</span>
              <span style={{ fontSize: 11, color: '#333', whiteSpace: 'nowrap', flexShrink: 0 }}>{new Date(a.created_at).toLocaleDateString('es-AR')}</span>
              <span style={{ fontSize: 12, color: '#444', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.views.toLocaleString()} vistas</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
