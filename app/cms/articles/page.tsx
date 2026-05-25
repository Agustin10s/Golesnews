'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
  id: number; title: string; slug: string; status: string;
  category: string; author_name: string; views: number;
  created_at: string; source_name: string;
}

const CATEGORIES = ['Todas','futbol','argentina','internacional','champions','libertadores','editorial'];
const STATUSES   = ['Todos','published','draft'];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal]       = useState(0);
  const [cat, setCat]           = useState('');
  const [status, setStatus]     = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  const load = (c = cat, s = status) => {
    setLoading(true);
    const p = new URLSearchParams({ limit: '100' });
    if (c) p.set('category', c);
    if (s) p.set('status', s);
    fetch(`/api/cms/articles?${p}`).then(r => r.json()).then((d: { articles?: Article[]; total?: number }) => {
      setArticles(d.articles || []); setTotal(d.total || 0); setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = search ? articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase())) : articles;

  async function deleteArticle(id: number) {
    if (!confirm('¿Eliminar este artículo?')) return;
    await fetch(`/api/cms/articles/${id}`, { method: 'DELETE' });
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Artículos</h1>
          <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>{total} artículos en total</p>
        </div>
        <Link href="/cms/articles/new" style={{ background: '#e8353a', color: '#fff', padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
          + Nueva nota
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          style={{ flex: 1, minWidth: 200, background: '#111', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none' }}
        />
        <select value={cat} onChange={e => { setCat(e.target.value); load(e.target.value, status); }}
          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#aaa', padding: '8px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          {CATEGORIES.map(c => <option key={c} value={c === 'Todas' ? '' : c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); load(cat, e.target.value); }}
          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#aaa', padding: '8px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          {STATUSES.map(s => <option key={s} value={s === 'Todos' ? '' : s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 80px 110px 100px', gap: 0 }}>
          {/* Header */}
          {['Título','Categoría','Estado','Vistas','Fecha','Acciones'].map(h => (
            <div key={h} style={{ padding: '10px 14px', background: '#161616', borderBottom: '1px solid #1e1e1e', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555' }}>{h}</div>
          ))}
          {/* Rows */}
          {loading ? (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#555', fontSize: 13 }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#555', fontSize: 13 }}>Sin artículos</div>
          ) : filtered.map(a => (
            <>
              <div key={`t-${a.id}`} style={{ padding: '10px 14px', borderBottom: '1px solid #171717', overflow: 'hidden' }}>
                <div style={{ fontSize: 13, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                {a.source_name && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>via {a.source_name}</div>}
              </div>
              <div key={`c-${a.id}`} style={{ padding: '10px 14px', borderBottom: '1px solid #171717', fontSize: 11, color: '#888' }}>{a.category}</div>
              <div key={`s-${a.id}`} style={{ padding: '10px 14px', borderBottom: '1px solid #171717' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 3, background: a.status === 'published' ? 'rgba(74,222,128,.1)' : 'rgba(250,204,21,.1)', color: a.status === 'published' ? '#4ade80' : '#facc15' }}>
                  {a.status === 'published' ? 'Pub.' : 'Draft'}
                </span>
              </div>
              <div key={`v-${a.id}`} style={{ padding: '10px 14px', borderBottom: '1px solid #171717', fontSize: 12, color: '#666' }}>{a.views}</div>
              <div key={`d-${a.id}`} style={{ padding: '10px 14px', borderBottom: '1px solid #171717', fontSize: 11, color: '#555' }}>{new Date(a.created_at).toLocaleDateString('es-AR')}</div>
              <div key={`a-${a.id}`} style={{ padding: '8px 10px', borderBottom: '1px solid #171717', display: 'flex', gap: 6, alignItems: 'center' }}>
                <Link href={`/cms/articles/${a.id}/edit`} style={{ fontSize: 11, color: '#e8353a', textDecoration: 'none', padding: '3px 8px', border: '1px solid rgba(232,53,58,.3)', borderRadius: 4 }}>Editar</Link>
                <button onClick={() => deleteArticle(a.id)} style={{ fontSize: 11, color: '#666', background: 'none', border: '1px solid #2a2a2a', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Borrar</button>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
