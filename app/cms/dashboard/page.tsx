'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats { total: number; published: number; draft: number; }
interface Article { id: number; title: string; status: string; category: string; created_at: string; views: number; }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });
  const [recent, setRecent] = useState<Article[]>([]);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/cms/auth/me').then(r => r.json()).then((d: { user?: { name: string; role: string } }) => { if (d.user) setUser(d.user); }).catch(() => {});

    fetch('/api/cms/articles?limit=5').then(r => r.json()).then((d: { articles?: Article[]; total?: number }) => {
      setRecent(d.articles || []);
      setStats(prev => ({ ...prev, total: d.total || 0 }));
    }).catch(() => {});

    fetch('/api/cms/articles?status=published&limit=1').then(r => r.json()).then((d: { total?: number }) => {
      setStats(prev => ({ ...prev, published: d.total || 0 }));
    }).catch(() => {});

    fetch('/api/cms/articles?status=draft&limit=1').then(r => r.json()).then((d: { total?: number }) => {
      setStats(prev => ({ ...prev, draft: d.total || 0 }));
    }).catch(() => {});
  }, []);

  const statCard = (label: string, value: number, color: string, icon: string) => (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '20px 24px', flex: 1 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 800, color: '#fff', margin: 0 }}>Dashboard</h1>
          {user && <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>Bienvenido, <strong style={{ color: '#aaa' }}>{user.name}</strong></p>}
        </div>
        <Link href="/cms/articles/new" style={{
          background: '#e8353a', color: '#fff', padding: '10px 20px', borderRadius: 6,
          fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: .5,
        }}>
          + Nueva nota
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {statCard('Total artículos', stats.total, '#fff', '📰')}
        {statCard('Publicados', stats.published, '#4ade80', '✅')}
        {statCard('Borradores', stats.draft, '#facc15', '📋')}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { href: '/cms/articles/new', icon: '✏️', label: 'Redactar nota', desc: 'Crear artículo manual' },
          { href: '/cms/autopublish',  icon: '🤖', label: 'Auto IA',       desc: 'Scraper + reescritura' },
          { href: '/cms/media',        icon: '🖼️', label: 'Archivos',      desc: 'Subir imágenes' },
          { href: '/cms/articles',     icon: '📋', label: 'Artículos',     desc: 'Ver todos' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 10,
            padding: '16px 18px', textDecoration: 'none', transition: 'border-color .15s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{a.label}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent articles */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Artículos recientes</span>
          <Link href="/cms/articles" style={{ fontSize: 12, color: '#e8353a', textDecoration: 'none' }}>Ver todos →</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13 }}>No hay artículos aún. <Link href="/cms/articles/new" style={{ color: '#e8353a', textDecoration: 'none' }}>Crear uno</Link></div>
        ) : recent.map(a => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid #171717' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: a.status === 'published' ? 'rgba(74,222,128,.1)' : 'rgba(250,204,21,.1)', color: a.status === 'published' ? '#4ade80' : '#facc15', whiteSpace: 'nowrap' }}>
              {a.status === 'published' ? 'Publicado' : 'Borrador'}
            </span>
            <Link href={`/cms/articles/${a.id}/edit`} style={{ flex: 1, fontSize: 13, color: '#e0e0e0', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {a.title}
            </Link>
            <span style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>{a.category}</span>
            <span style={{ fontSize: 11, color: '#444', whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleDateString('es-AR')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
