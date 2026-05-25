'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('../../components/RichEditor'), { ssr: false, loading: () => <div style={{ height: 400, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>Cargando editor...</div> });

const CATEGORIES = ['futbol','argentina','internacional','champions','libertadores','mls','editorial','transfers','lesiones'];

interface SeoData { seo_title: string; seo_description: string; seo_keywords: string; tags: string[]; }

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', excerpt: '', category: 'futbol', status: 'draft', featured_image: '', seo_title: '', seo_description: '', seo_keywords: '' });
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleContent = useCallback((html: string) => setContent(html), []);

  async function optimizeSeo() {
    if (!form.title || !content) { setMsg('⚠ Completá título y contenido primero'); return; }
    setSeoLoading(true);
    const res = await fetch('/api/cms/ai/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, content, category: form.category }) });
    const data = await res.json() as SeoData & { error?: string };
    if (data.seo_title) {
      setForm(p => ({ ...p, seo_title: data.seo_title, seo_description: data.seo_description, seo_keywords: data.seo_keywords }));
      setTags(data.tags?.join(', ') || '');
      setMsg('✅ SEO optimizado con IA');
    } else setMsg(`⚠ ${data.error || 'Error al optimizar'}`);
    setSeoLoading(false);
  }

  async function save(status: string) {
    if (!form.title || !content) { setMsg('⚠ Título y contenido son requeridos'); return; }
    setSaving(true);
    const res = await fetch('/api/cms/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }),
    });
    const data = await res.json() as { id?: number; slug?: string; error?: string };
    if (data.id) {
      router.push('/cms/articles');
    } else {
      setMsg(`Error: ${data.error || 'Desconocido'}`);
      setSaving(false);
    }
  }

  const inp = (label: string, key: string, opts?: { multiline?: boolean; placeholder?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>{label}</label>
      {opts?.multiline ? (
        <textarea value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} rows={3} placeholder={opts.placeholder}
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      ) : (
        <input value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={opts?.placeholder}
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Nueva nota</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('✅') ? '#4ade80' : '#e8353a' }}>{msg}</span>}
          <button onClick={() => save('draft')} disabled={saving} style={{ padding: '9px 18px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar borrador</button>
          <button onClick={() => save('published')} disabled={saving} style={{ padding: '9px 18px', background: '#e8353a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Publicando...' : 'Publicar'}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main */}
        <div>
          {inp('Título *', 'title', { placeholder: 'Título de la nota' })}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Contenido *</label>
            <RichEditor content={content} onChange={handleContent} />
          </div>
          {inp('Extracto', 'excerpt', { multiline: true, placeholder: 'Resumen breve (aparece en listados y redes sociales)' })}
        </div>

        {/* Sidebar */}
        <div>
          {/* Publish */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12, margin: '0 0 12px' }}>Publicación</h3>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5 }}>CATEGORÍA</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5 }}>TAGS (separados por coma)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="argentina, messi, racing..."
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Featured image */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Imagen destacada</h3>
            <input value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder="URL de imagen o subir desde archivos"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            {form.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featured_image} alt="" style={{ width: '100%', marginTop: 8, borderRadius: 6, objectFit: 'cover', maxHeight: 160 }} />
            )}
          </div>

          {/* SEO Panel */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>SEO</h3>
              <button onClick={optimizeSeo} disabled={seoLoading}
                style={{ fontSize: 10, fontWeight: 700, padding: '5px 12px', background: seoLoading ? '#333' : 'rgba(232,53,58,.15)', border: '1px solid rgba(232,53,58,.3)', color: seoLoading ? '#555' : '#e8353a', borderRadius: 4, cursor: 'pointer', letterSpacing: .5 }}>
                {seoLoading ? '⏳ Optimizando...' : '✨ Optimizar con IA'}
              </button>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#555', marginBottom: 4 }}>TÍTULO SEO (60 chars)</label>
              <input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} maxLength={60}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              <div style={{ fontSize: 10, color: '#444', textAlign: 'right' }}>{form.seo_title.length}/60</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 10, color: '#555', marginBottom: 4 }}>META DESCRIPTION (155 chars)</label>
              <textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={3} maxLength={155}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              <div style={{ fontSize: 10, color: form.seo_description.length > 140 ? '#4ade80' : '#444', textAlign: 'right' }}>{form.seo_description.length}/155</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: '#555', marginBottom: 4 }}>KEYWORDS</label>
              <input value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginTop: 10, padding: '8px 10px', background: '#161616', borderRadius: 6, fontSize: 10, color: '#555', lineHeight: 1.6 }}>
              💡 Requiere <code style={{ color: '#e8353a' }}>ANTHROPIC_API_KEY</code> en Railway para usar IA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
