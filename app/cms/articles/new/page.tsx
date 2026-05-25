'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SeoPanel from '../../components/SeoPanel';

const RichEditor = dynamic(() => import('../../components/RichEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
      Cargando editor...
    </div>
  ),
});

const CATEGORIES = ['futbol','argentina','internacional','champions','libertadores','mls','editorial','transfers','lesiones'];

export default function NewArticlePage() {
  const router = useRouter();
  const contentRef = useRef('');

  const [title,         setTitle]         = useState('');
  const [excerpt,       setExcerpt]       = useState('');
  const [category,      setCategory]      = useState('futbol');
  const [tags,          setTags]          = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [seo,           setSeo]           = useState({ seo_title: '', seo_description: '', seo_keywords: '' });
  const [saving,        setSaving]        = useState(false);
  const [msg,           setMsg]           = useState('');

  const handleContent = useCallback((html: string) => { contentRef.current = html; }, []);

  async function save(status: string) {
    if (!title || !contentRef.current) { setMsg('⚠ Título y contenido son requeridos'); return; }
    setSaving(true); setMsg('');
    const res = await fetch('/api/cms/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, excerpt, category, status,
        content: contentRef.current,
        featured_image: featuredImage,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        ...seo,
      }),
    });
    const data = await res.json() as { id?: number; error?: string };
    if (data.id) {
      router.push('/cms/articles');
    } else {
      setMsg(`⚠ ${data.error || 'Error al guardar'}`);
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>
          Nueva nota
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('⚠') ? '#e8353a' : '#4ade80' }}>{msg}</span>}
          <button onClick={() => save('draft')} disabled={saving}
            style={{ padding: '9px 18px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Guardar borrador
          </button>
          <button onClick={() => save('published')} disabled={saving}
            style={{ padding: '9px 20px', background: '#e8353a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Publicando...' : '✅ Publicar'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main column */}
        <div>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Título *</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Título de la nota"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '11px 12px', borderRadius: 6, fontSize: 15, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Editor */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Contenido *</label>
            <RichEditor content="" onChange={handleContent} />
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Extracto</label>
            <textarea
              value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
              placeholder="Resumen breve (aparece en portada y redes sociales)"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Publish settings */}
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
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Tags (separados por coma)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="argentina, messi, river..."
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Featured image */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Imagen destacada</h3>
            <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://... URL de la imagen"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImage} alt="" style={{ width: '100%', marginTop: 8, borderRadius: 6, objectFit: 'cover', maxHeight: 150 }} />
            )}
          </div>

          {/* SEO */}
          <SeoPanel
            values={seo}
            onChange={setSeo}
            getContent={() => ({ title, content: contentRef.current, category })}
            onTagsFromAi={t => setTags(prev => prev ? prev : t)}
          />
        </div>
      </div>
    </div>
  );
}
