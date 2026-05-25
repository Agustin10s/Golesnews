'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SeoPanel from '../../components/SeoPanel';

const RichEditor = dynamic(() => import('../../components/RichEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, background: '#0a0a0a', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>
      Cargando editor...
    </div>
  ),
});

interface Category { id: number; slug: string; label: string; color: string; }

const FIELD_LABEL: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1,
  textTransform: 'uppercase', color: '#444', marginBottom: 6,
};
const INPUT: React.CSSProperties = {
  width: '100%', background: '#0a0a0a', border: '1px solid #1e1e1e',
  color: '#e0e0e0', padding: '11px 12px', outline: 'none', boxSizing: 'border-box',
  fontSize: 13, fontFamily: 'inherit', borderRadius: 4,
};

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData(); fd.append('file', file);
  try {
    const d = await fetch('/api/cms/media/upload', { method: 'POST', body: fd }).then(r => r.json()) as { url?: string };
    return d.url ?? null;
  } catch { return null; }
}

export default function NewArticlePage() {
  const router  = useRouter();
  const contentRef = useRef('');

  const [title,         setTitle]         = useState('');
  const [copete,        setCopete]        = useState('');
  const [excerpt,       setExcerpt]       = useState('');
  const [category,      setCategory]      = useState('futbol');
  const [tags,          setTags]          = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [seo,           setSeo]           = useState({ seo_title: '', seo_description: '', seo_keywords: '' });
  const [saving,        setSaving]        = useState(false);
  const [msg,           setMsg]           = useState('');
  const [preview,       setPreview]       = useState(false);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [imgUploading,  setImgUploading]  = useState(false);
  const [imgDragging,   setImgDragging]   = useState(false);
  const [section,       setSection]       = useState('');
  const [subcategory,   setSubcategory]   = useState('');
  const imgInputRef = useRef<HTMLInputElement>(null);

  const ARGENTINA_TEAMS = [
    { slug: 'boca',          label: 'Boca' },
    { slug: 'river',         label: 'River' },
    { slug: 'independiente', label: 'Independiente' },
    { slug: 'racing',        label: 'Racing' },
    { slug: 'estudiantes',   label: 'Estudiantes' },
    { slug: 'san-lorenzo',   label: 'San Lorenzo' },
    { slug: 'huracan',       label: 'Huracán' },
  ];

  const SECTIONS = [
    { slug: '',          label: 'Auto (por fecha)' },
    { slug: 'inicio',    label: 'Inicio / Hero' },
    { slug: 'destacado', label: 'Destacado' },
    { slug: 'ultimas',   label: 'Últimas Noticias' },
    { slug: 'mundo',     label: 'Más del Mundo' },
    { slug: 'otras',     label: 'Otras Noticias' },
  ];

  useEffect(() => {
    fetch('/api/cms/categories').then(r => r.json())
      .then((d: { categories?: Category[] }) => { if (d.categories?.length) setCategories(d.categories); })
      .catch(() => {});
  }, []);

  const handleContent = useCallback((html: string) => { contentRef.current = html; }, []);

  async function handleFeaturedImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setImgUploading(true);
    const url = await uploadImage(file);
    if (url) setFeaturedImage(url);
    setImgUploading(false);
  }

  async function save(status: string) {
    if (!title || !contentRef.current) { setMsg('Título y contenido son requeridos'); return; }
    setSaving(true); setMsg('');
    const res = await fetch('/api/cms/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, copete, excerpt, category, status,
        content: contentRef.current,
        featured_image: featuredImage,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        section, subcategory,
        ...seo,
      }),
    });
    const data = await res.json() as { id?: number; error?: string };
    if (data.id) {
      router.push('/cms/articles');
    } else {
      setMsg(data.error || 'Error al guardar');
      setSaving(false);
    }
  }

  const catColor = categories.find(c => c.slug === category)?.color ?? '#e8353a';

  if (preview) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={() => setPreview(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid #2a2a2a', color: '#888', padding: '8px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
            Volver al editor
          </button>
          <span style={{ fontSize: 12, color: '#555' }}>Vista previa — como aparecerá en el sitio</span>
        </div>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featuredImage} alt="" style={{ width: '100%', maxHeight: 480, objectFit: 'cover', borderRadius: 4, marginBottom: 24 }} />
          )}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: catColor }}>{categories.find(c => c.slug === category)?.label ?? category}</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(28px,4vw,50px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>{title || 'Sin título'}</h1>
          {copete && <p style={{ fontSize: 17, color: '#ccc', lineHeight: 1.6, marginBottom: 20, fontWeight: 400, borderLeft: '3px solid #e8353a', paddingLeft: 14 }}>{copete}</p>}
          {excerpt && <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>{excerpt}</p>}
          <div
            className="article-content"
            style={{ fontSize: 16, lineHeight: 1.8, color: '#d0d0d0' }}
            dangerouslySetInnerHTML={{ __html: contentRef.current || '<p style="color:#555">El contenido aparecerá aquí...</p>' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -.5 }}>Nueva nota</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: '#e8353a', padding: '6px 12px', background: 'rgba(232,53,58,.08)', border: '1px solid rgba(232,53,58,.2)', borderRadius: 4 }}>{msg}</span>}
          <button onClick={() => setPreview(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'none', border: '1px solid #2a2a2a', color: '#777', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Vista previa
          </button>
          <button onClick={() => save('draft')} disabled={saving}
            style={{ padding: '9px 16px', background: '#111', border: '1px solid #2a2a2a', color: '#888', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Guardar borrador
          </button>
          <button onClick={() => save('published')} disabled={saving}
            style={{ padding: '9px 18px', background: '#e8353a', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: .3 }}>
            {saving ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Main column */}
        <div>
          {/* Category selector — shown as pills */}
          <div style={{ marginBottom: 18 }}>
            <label style={FIELD_LABEL}>Categoria principal</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(categories.length > 0 ? categories : [{ id: 0, slug: 'futbol', label: 'Fútbol', color: '#e8353a' }]).map(c => (
                <button key={c.slug} onClick={() => setCategory(c.slug)} style={{
                  padding: '6px 14px', fontSize: 11, fontWeight: 600, letterSpacing: .5,
                  borderRadius: 3, cursor: 'pointer', transition: 'all .1s',
                  border: category === c.slug ? `1px solid ${c.color}` : '1px solid #1e1e1e',
                  background: category === c.slug ? `${c.color}22` : '#0a0a0a',
                  color: category === c.slug ? c.color : '#555',
                }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={FIELD_LABEL}>Título *</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Título de la nota"
              style={{ ...INPUT, fontSize: 20, fontWeight: 700, padding: '13px 14px' }}
            />
          </div>

          {/* Copete */}
          <div style={{ marginBottom: 16 }}>
            <label style={FIELD_LABEL}>Copete <span style={{ fontSize: 9, color: '#333', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— bajada / subtítulo corto</span></label>
            <textarea
              value={copete} onChange={e => setCopete(e.target.value)} rows={2}
              placeholder="Una o dos oraciones que introducen la nota"
              style={{ ...INPUT, resize: 'vertical', lineHeight: 1.5, fontSize: 14 }}
            />
          </div>

          {/* Editor */}
          <div style={{ marginBottom: 16 }}>
            <label style={FIELD_LABEL}>Redaccion *</label>
            <RichEditor content="" onChange={handleContent} />
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: 16 }}>
            <label style={FIELD_LABEL}>Resumen para portada <span style={{ fontSize: 9, color: '#333', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— aparece en la home y redes</span></label>
            <textarea
              value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
              placeholder="Resumen breve"
              style={{ ...INPUT, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Featured image */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 5, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Imagen destacada</div>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setImgDragging(true); }}
              onDragLeave={() => setImgDragging(false)}
              onDrop={async e => {
                e.preventDefault(); setImgDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) await handleFeaturedImageFile(file);
              }}
              onClick={() => !featuredImage && imgInputRef.current?.click()}
              style={{
                border: `1px dashed ${imgDragging ? '#e8353a' : '#2a2a2a'}`,
                borderRadius: 4, padding: '0',
                background: imgDragging ? 'rgba(232,53,58,.05)' : 'transparent',
                cursor: featuredImage ? 'default' : 'pointer',
                transition: 'all .15s', overflow: 'hidden', position: 'relative',
                minHeight: featuredImage ? 0 : 90,
              }}
            >
              {featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredImage} alt="" style={{ width: '100%', display: 'block', borderRadius: 4, maxHeight: 180, objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '20px 16px' }}>
                  {imgUploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: 12 }}>
                      <div style={{ width: 14, height: 14, border: '2px solid #333', borderTopColor: '#e8353a', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                      Subiendo...
                    </div>
                  ) : (
                    <>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                      <span style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>Arrastrá o hacé click para subir</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {featuredImage && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => imgInputRef.current?.click()} style={{ flex: 1, fontSize: 11, padding: '7px', background: '#111', border: '1px solid #222', color: '#888', cursor: 'pointer', borderRadius: 3 }}>
                  Cambiar imagen
                </button>
                <button onClick={() => setFeaturedImage('')} style={{ fontSize: 11, padding: '7px 10px', background: 'none', border: '1px solid #2a1a1a', color: '#663333', cursor: 'pointer', borderRadius: 3 }}>
                  Eliminar
                </button>
              </div>
            )}
            <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
              const file = e.target.files?.[0]; if (file) await handleFeaturedImageFile(file); e.target.value = '';
            }} />
            <div style={{ marginTop: featuredImage ? 0 : 8 }}>
              <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="O pegá una URL"
                style={{ ...INPUT, fontSize: 11, padding: '7px 10px', marginTop: 8 }} />
            </div>
          </div>

          {/* Section placement */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 5, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Sección del inicio</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {SECTIONS.map(s => (
                <button key={s.slug} onClick={() => setSection(s.slug)} style={{
                  padding: '7px 10px', fontSize: 11, fontWeight: 600, textAlign: 'left',
                  borderRadius: 3, cursor: 'pointer', transition: 'all .1s',
                  border: section === s.slug ? '1px solid #e8353a' : '1px solid #1e1e1e',
                  background: section === s.slug ? 'rgba(232,53,58,.1)' : '#0a0a0a',
                  color: section === s.slug ? '#e8353a' : '#555',
                }}>
                  {s.slug === '' ? (
                    <><span style={{ opacity: .5 }}>◦</span> {s.label}</>
                  ) : (
                    <><span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, marginRight: 4 }}>{s.slug.toUpperCase()}</span> — {s.label}</>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Argentina subcategories */}
          {category === 'argentina' && (
            <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 5, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#3b82f6', marginBottom: 10 }}>Equipo (Argentina)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                <button onClick={() => setSubcategory('')} style={{
                  padding: '5px 10px', fontSize: 10, fontWeight: 600, borderRadius: 3, cursor: 'pointer',
                  border: subcategory === '' ? '1px solid #3b82f6' : '1px solid #1e1e1e',
                  background: subcategory === '' ? 'rgba(59,130,246,.12)' : '#0a0a0a',
                  color: subcategory === '' ? '#3b82f6' : '#555',
                }}>General</button>
                {ARGENTINA_TEAMS.map(t => (
                  <button key={t.slug} onClick={() => setSubcategory(subcategory === t.slug ? '' : t.slug)} style={{
                    padding: '5px 10px', fontSize: 10, fontWeight: 600, borderRadius: 3, cursor: 'pointer',
                    border: subcategory === t.slug ? '1px solid #3b82f6' : '1px solid #1e1e1e',
                    background: subcategory === t.slug ? 'rgba(59,130,246,.12)' : '#0a0a0a',
                    color: subcategory === t.slug ? '#3b82f6' : '#555',
                  }}>{t.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Publish settings */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 5, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Publicación</div>
            <div>
              <label style={{ ...FIELD_LABEL, marginBottom: 5 }}>Tags <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 9, color: '#333' }}>(separados por coma)</span></label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="messi, river, champions..."
                style={{ ...INPUT, fontSize: 12, padding: '9px 10px' }} />
            </div>
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
