'use client';
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SeoPanel from '../../../components/SeoPanel';

const RichEditor = dynamic(() => import('../../../components/RichEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
      Cargando editor...
    </div>
  ),
});

const CATEGORIES = ['futbol','argentina','internacional','champions','libertadores','mls','editorial','transfers','lesiones'];

interface ArticleData {
  id: number; title: string; excerpt: string; content: string;
  category: string; status: string; featured_image: string;
  seo_title: string; seo_description: string; seo_keywords: string;
  tags: string;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const contentRef = useRef('');

  const [title,         setTitle]         = useState('');
  const [excerpt,       setExcerpt]       = useState('');
  const [category,      setCategory]      = useState('futbol');
  const [status,        setStatus]        = useState('draft');
  const [tags,          setTags]          = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [seo,           setSeo]           = useState({ seo_title: '', seo_description: '', seo_keywords: '' });
  const [initContent,   setInitContent]   = useState('');
  const [saving,        setSaving]        = useState(false);
  const [msg,           setMsg]           = useState('');
  const [loaded,        setLoaded]        = useState(false);

  useEffect(() => {
    fetch(`/api/cms/articles/${id}`)
      .then(r => r.json())
      .then((d: { article?: ArticleData }) => {
        if (!d.article) return;
        const a = d.article;
        setTitle(a.title);
        setExcerpt(a.excerpt);
        setCategory(a.category);
        setStatus(a.status);
        setFeaturedImage(a.featured_image || '');
        setSeo({ seo_title: a.seo_title, seo_description: a.seo_description, seo_keywords: a.seo_keywords });
        setInitContent(a.content);
        contentRef.current = a.content;
        try { setTags(JSON.parse(a.tags).join(', ')); } catch { setTags(a.tags || ''); }
        setLoaded(true);
      })
      .catch(() => {});
  }, [id]);

  const handleContent = useCallback((html: string) => { contentRef.current = html; }, []);

  async function save(newStatus?: string) {
    if (!title || !contentRef.current) { setMsg('⚠ Título y contenido son requeridos'); return; }
    setSaving(true); setMsg('');
    const finalStatus = newStatus ?? status;
    const res = await fetch(`/api/cms/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, excerpt, category,
        status: finalStatus,
        content: contentRef.current,
        featured_image: featuredImage,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        ...seo,
      }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (data.ok) {
      setMsg('✅ Guardado');
      if (newStatus) setStatus(newStatus);
    } else {
      setMsg(`⚠ ${data.error || 'Error al guardar'}`);
    }
    setSaving(false);
  }

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#555', fontSize: 14 }}>
      Cargando artículo...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Editar nota</h1>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 3,
            background: status === 'published' ? 'rgba(74,222,128,.1)' : 'rgba(250,204,21,.1)',
            color: status === 'published' ? '#4ade80' : '#facc15',
          }}>
            {status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('✅') ? '#4ade80' : '#e8353a' }}>{msg}</span>}
          <button onClick={() => router.push('/cms/articles')}
            style={{ padding: '9px 14px', background: 'none', border: '1px solid #2a2a2a', color: '#666', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
            ← Volver
          </button>
          <button onClick={() => save()} disabled={saving}
            style={{ padding: '9px 18px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Guardar
          </button>
          {status !== 'published' ? (
            <button onClick={() => save('published')} disabled={saving}
              style={{ padding: '9px 20px', background: '#e8353a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ✅ Publicar
            </button>
          ) : (
            <button onClick={() => save('draft')} disabled={saving}
              style={{ padding: '9px 18px', background: '#1a1a1a', border: '1px solid #facc15', color: '#facc15', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Volver a borrador
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '11px 12px', borderRadius: 6, fontSize: 15, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Contenido *</label>
            <RichEditor content={initContent} onChange={handleContent} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Extracto</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Publicación</h3>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Tags</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="argentina, messi..."
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Imagen destacada</h3>
            <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..."
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImage} alt="" style={{ width: '100%', marginTop: 8, borderRadius: 6, objectFit: 'cover', maxHeight: 150 }} />
            )}
          </div>

          <SeoPanel
            values={seo}
            onChange={setSeo}
            getContent={() => ({ title, content: contentRef.current, category })}
            onTagsFromAi={t => setTags(prev => prev || t)}
          />
        </div>
      </div>
    </div>
  );
}
