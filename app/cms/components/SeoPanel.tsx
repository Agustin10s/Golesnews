'use client';
import { useState, useEffect } from 'react';

interface SeoValues {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

interface Props {
  values: SeoValues;
  onChange: (v: SeoValues) => void;
  getContent: () => { title: string; content: string; category: string };
  onTagsFromAi?: (tags: string) => void;
}

export default function SeoPanel({ values, onChange, getContent, onTagsFromAi }: Props) {
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/cms/ai/check')
      .then(r => r.json())
      .then((d: { available: boolean }) => setAiAvailable(d.available))
      .catch(() => setAiAvailable(false));
  }, []);

  const set = (k: keyof SeoValues, v: string) => onChange({ ...values, [k]: v });

  async function optimize() {
    const { title, content, category } = getContent();
    if (!title || !content) { setMsg('⚠ Completá título y contenido primero'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/api/cms/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json() as SeoValues & { tags?: string[]; error?: string };
      if (data.error) { setMsg(`⚠ ${data.error}`); return; }
      onChange({ seo_title: data.seo_title, seo_description: data.seo_description, seo_keywords: data.seo_keywords });
      if (data.tags?.length && onTagsFromAi) onTagsFromAi(data.tags.join(', '));
      setMsg('✅ SEO optimizado con IA');
    } catch (e) {
      setMsg(`⚠ Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>
          🔍 SEO
        </h3>
        {aiAvailable === null ? (
          <span style={{ fontSize: 10, color: '#555' }}>Verificando IA...</span>
        ) : aiAvailable ? (
          <button
            onClick={optimize}
            disabled={loading}
            style={{
              fontSize: 10, fontWeight: 700, padding: '5px 12px',
              background: loading ? '#222' : 'rgba(232,53,58,.15)',
              border: '1px solid rgba(232,53,58,.3)',
              color: loading ? '#555' : '#e8353a',
              borderRadius: 4, cursor: loading ? 'wait' : 'pointer', letterSpacing: .5,
            }}
          >
            {loading ? '⏳ Optimizando...' : '✨ Optimizar con IA'}
          </button>
        ) : (
          <span style={{ fontSize: 10, color: '#facc15', background: 'rgba(250,204,21,.08)', border: '1px solid rgba(250,204,21,.2)', padding: '4px 10px', borderRadius: 4 }}>
            Sin clave IA
          </span>
        )}
      </div>

      {/* AI not available notice */}
      {aiAvailable === false && (
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(250,204,21,.06)', border: '1px solid rgba(250,204,21,.15)', borderRadius: 6, fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
          Para optimizar SEO con IA agregá en <strong style={{ color: '#facc15' }}>Railway → Variables</strong>:<br />
          <code style={{ color: '#e8353a', background: '#1a1a1a', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>ANTHROPIC_API_KEY</code>
          {' → '}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: '#e8353a', fontSize: 11 }}>Obtener clave gratis →</a>
          <br /><span style={{ fontSize: 10, color: '#666' }}>Podés completar los campos manualmente mientras tanto.</span>
        </div>
      )}

      {/* Feedback */}
      {msg && (
        <div style={{ marginBottom: 10, fontSize: 11, color: msg.startsWith('✅') ? '#4ade80' : '#e8353a', padding: '6px 10px', background: msg.startsWith('✅') ? 'rgba(74,222,128,.07)' : 'rgba(232,53,58,.07)', borderRadius: 4 }}>
          {msg}
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <label style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Título SEO</label>
          <span style={{ fontSize: 10, color: values.seo_title.length > 55 ? '#4ade80' : '#555' }}>{values.seo_title.length}/60</span>
        </div>
        <input
          value={values.seo_title}
          onChange={e => set('seo_title', e.target.value)}
          maxLength={60}
          placeholder="Título optimizado para Google (máx 60 chars)"
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <label style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Meta description</label>
          <span style={{ fontSize: 10, color: values.seo_description.length >= 140 ? '#4ade80' : '#555' }}>{values.seo_description.length}/155</span>
        </div>
        <textarea
          value={values.seo_description}
          onChange={e => set('seo_description', e.target.value)}
          rows={3} maxLength={155}
          placeholder="Descripción que aparece en Google (140-155 chars ideal)"
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      </div>

      {/* Keywords */}
      <div>
        <label style={{ display: 'block', fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Keywords</label>
        <input
          value={values.seo_keywords}
          onChange={e => set('seo_keywords', e.target.value)}
          placeholder="keyword1, keyword2, keyword3..."
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '8px 10px', borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Google preview */}
      {(values.seo_title || values.seo_description) && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6 }}>
          <div style={{ fontSize: 9, color: '#555', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Vista previa Google</div>
          {values.seo_title && <div style={{ fontSize: 14, color: '#8ab4f8', marginBottom: 2, lineHeight: 1.3 }}>{values.seo_title}</div>}
          <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 2 }}>golesnews.com › nota › ...</div>
          {values.seo_description && <div style={{ fontSize: 12, color: '#bbb', lineHeight: 1.5 }}>{values.seo_description}</div>}
        </div>
      )}
    </div>
  );
}
