'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('../../../components/RichEditor'), { ssr: false, loading: () => <div style={{ height: 400, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>Cargando editor...</div> });

const CATEGORIES = ['futbol','argentina','internacional','champions','libertadores','mls','editorial','transfers','lesiones'];
interface SeoData { seo_title: string; seo_description: string; seo_keywords: string; tags: string[]; }
interface ArticleData { id: number; title: string; excerpt: string; content: string; category: string; status: string; featured_image: string; seo_title: string; seo_description: string; seo_keywords: string; tags: string; source_name: string; }

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ title: '', excerpt: '', category: 'futbol', status: 'draft', featured_image: '', seo_title: '', seo_description: '', seo_keywords: '' });
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/cms/articles/${id}`).then(r => r.json()).then((d: { article?: ArticleData }) => {
      if (d.article) {
        const a = d.article;
        setForm({ title: a.title, excerpt: a.excerpt, category: a.category, status: a.status, featured_image: a.featured_image, seo_title: a.seo_title, seo_description: a.seo_description, seo_keywords: a.seo_keywords });
        setContent(a.content);
        try { setTags(JSON.parse(a.tags).join(', ')); } catch { setTags(a.tags); }
        setLoaded(true);
      }
    }).catch(() => {});
  }, [id]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleContent = useCallback((html: string) => setContent(html), []);

  async function optimizeSeo() {
    if (!form.title || !content) { setMsg('⚠ Completá título y contenido primero'); return; }
    setSeoLoading(true);
    const res = await fetch('/api/cms/ai/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, content, category: form.category }) });
    const data = await res.json() as SeoData & { error?: string };
    if (data.seo_title) {
      setForm(p => ({ ...p, seo_title: data.seo_title, seo_description: data.seo_description, seo_keywords: data.seo_keywords }));
      setTags(data.tags?.join(', ') || tags);
      setMsg('✅ SEO optimizado con IA');
    } else setMsg(`⚠ ${data.error || 'Error al optimizar'}`);
    setSeoLoading(false);
  }

  async function save(newStatus?: string) {
    if (!form.title || !content) { setMsg('⚠ Título y contenido son requeridos'); return; }
    setSaving(true);
    const res = await fetch(`/api/cms/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: newStatus || form.status, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (data.ok) {
      setMsg('✅ Guardado'); if (newStatus) setForm(p => ({ ...p, status: newStatus }));
    } else setMsg(`Error: ${data.error}`);
    setSaving(false);
  }

  if (!loaded) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#555', fontSize: 14 }}>Cargando artículo...</div>;

  const inp = (label: string, key: string, opts?: { multiline?: boolean; placeholder?: string; maxLen?: number }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>{label}</label>
      {opts?.multiline ? (
        <textarea value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} rows={3} maxLength={opts.maxLen} placeholder={opts.placeholder}
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      ) : (
        <input value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={opts?.placeholder} maxLength={opts?.maxLen}
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Editar nota</h1>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: form.status === 'published' ? 'rgba(74,222,128,.1)' : 'rgba(250,204,21,.1)', color: form.status === 'published' ? '#4ade80' : '#facc15' }}>
            {form.status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('✅') ? '#4ade80' : '#e8353a' }}>{msg}</span>}
          <button onClick={() => router.push('/cms/articles')} style={{ padding: '9px 14px', background: 'none', border: '1px solid #2a2a2a', color: '#666', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>← Volver</button>
          <button onClick={() => save()} disabled={saving} style={{ padding: '9px 18px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
          {form.status !== 'published' && (
            <button onClick={() => save('published')} disabled={saving} style={{ padding: '9px 18px', background: '#e8353a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Publicar</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          {inp('Título *', 'title')}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Contenido *</label>
            <RichEditor content={content} onChange={handleContent} />
          </div>
          {inp('Extracto', 'excerpt', { multiline: true })}
        </div>

        <div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Publicación</h3>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5 }}>CATEGORÍA</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5 }}>TAGS</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="argentina, messi..." style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Imagen destacada</h3>
            <input value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder="URL de imagen" style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '9px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            {form.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featured_image} alt="" style={{ width: '100%', marginTop: 8, borderRadius: 6, objectFit: 'cover', maxHeight: 160 }} />
            )}
          </div>

          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>SEO</h3>
              <button onClick={optimizeSeo} disabled={seoLoading} style={{ fontSize: 10, fontWeight: 700, padding: '5px 12px', background: seoLoading ? '#333' : 'rgba(232,53,58,.15)', border: '1px solid rgba(232,53,58,.3)', color: seoLoading ? '#555' : '#e8353a', borderRadius: 4, cursor: 'pointer' }}>
                {seoLoading ? '⏳...' : '✨ IA'}
              </button>
            </div>
            {inp('Título SEO', 'seo_title', { maxLen: 60 })}
            {inp('Meta description', 'seo_description', { multiline: true, maxLen: 155 })}
            {inp('Keywords', 'seo_keywords')}
          </div>
        </div>
      </div>
    </div>
  );
}
