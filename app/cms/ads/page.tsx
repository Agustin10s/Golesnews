'use client';
import { useEffect, useState } from 'react';

interface Ad {
  id: number; name: string; placement: string; type: string;
  content: string; link_url: string; enabled: number;
  impressions: number; clicks: number;
}

const PLACEMENTS = [
  { value: 'header-banner',   label: 'Header Banner (728×90)' },
  { value: 'sidebar-top',     label: 'Sidebar Superior (300×250)' },
  { value: 'sidebar-mid',     label: 'Sidebar Medio (300×250)' },
  { value: 'in-article',      label: 'En Artículo' },
  { value: 'popup',           label: 'Pop-up' },
  { value: 'sticky-bottom',   label: 'Sticky Inferior' },
];

const TYPES = [
  { value: 'image',   label: 'Imagen + Link' },
  { value: 'code',    label: 'Código HTML / Script' },
  { value: 'adsense', label: 'Google AdSense' },
];

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1,
  textTransform: 'uppercase', color: '#555', marginBottom: 5,
};
const INPUT: React.CSSProperties = {
  width: '100%', background: '#111', border: '1px solid #222',
  color: '#e0e0e0', padding: '9px 11px', fontSize: 13,
  outline: 'none', boxSizing: 'border-box', borderRadius: 4, fontFamily: 'inherit',
};

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState({ name: '', placement: 'header-banner', type: 'image', content: '', link_url: '', enabled: 1 });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() { const d = await fetch('/api/cms/ads').then(r => r.json()) as { ads: Ad[] }; setAds(d.ads ?? []); }
  useEffect(() => { load(); }, []);

  function startNew() { setEditing(null); setForm({ name: '', placement: 'header-banner', type: 'image', content: '', link_url: '', enabled: 1 }); setShowForm(true); }
  function startEdit(a: Ad) { setEditing(a); setForm({ name: a.name, placement: a.placement, type: a.type, content: a.content, link_url: a.link_url, enabled: a.enabled }); setShowForm(true); }
  function cancelForm() { setShowForm(false); setEditing(null); }

  async function save() {
    if (!form.name) { setMsg('El nombre es requerido'); return; }
    setLoading(true); setMsg('');
    if (editing) {
      await fetch('/api/cms/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) });
    } else {
      await fetch('/api/cms/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setLoading(false); cancelForm(); setMsg('Guardado');
    load(); setTimeout(() => setMsg(''), 3000);
  }

  async function toggleEnabled(a: Ad) {
    await fetch('/api/cms/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id, enabled: a.enabled ? 0 : 1 }) });
    load();
  }

  async function deleteAd(id: number) {
    if (!confirm('Eliminar este aviso?')) return;
    await fetch(`/api/cms/ads?id=${id}`, { method: 'DELETE' });
    load();
  }

  const placementLabel = (p: string) => PLACEMENTS.find(x => x.value === p)?.label ?? p;
  const ctr = (a: Ad) => a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) + '%' : '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Publicidad</h1>
          <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0' }}>Gestión de avisos publicitarios</p>
        </div>
        <button onClick={startNew} style={{ background: '#e8353a', color: '#fff', border: 'none', padding: '10px 20px', fontSize: 12, fontWeight: 700, letterSpacing: .5, cursor: 'pointer', borderRadius: 4 }}>
          + Nuevo aviso
        </button>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', color: '#4ade80', fontSize: 13, borderRadius: 4 }}>{msg}</div>}

      {/* Placement reference */}
      <div style={{ marginBottom: 20, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Ubicaciones disponibles</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PLACEMENTS.map(p => (
            <span key={p.value} style={{ fontSize: 11, padding: '4px 10px', background: '#161616', border: '1px solid #222', color: '#888', borderRadius: 3 }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#0e0e0e', border: '1px solid #222', padding: 20, marginBottom: 20, borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 18px' }}>
            {editing ? 'Editar aviso' : 'Nuevo aviso'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Nombre del aviso *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Banner home principal" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Ubicación</label>
              <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))} style={{ ...INPUT, cursor: 'pointer' }}>
                {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...INPUT, cursor: 'pointer' }}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>URL destino (click)</label>
              <input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." style={INPUT} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>
              {form.type === 'image' ? 'URL de la imagen' : form.type === 'adsense' ? 'Código AdSense' : 'Código HTML/Script'}
            </label>
            {form.type === 'image' ? (
              <input value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="https://..." style={INPUT} />
            ) : (
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5}
                placeholder={form.type === 'adsense' ? '<script async src="..."></script>\n<ins class="adsbygoogle"...' : '<div>Código HTML aquí</div>'}
                style={{ ...INPUT, resize: 'vertical' }} />
            )}
          </div>
          {form.type === 'image' && form.content && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.content} alt="preview" style={{ maxHeight: 100, maxWidth: 400, objectFit: 'contain', marginBottom: 12, border: '1px solid #222', borderRadius: 4 }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#aaa' }}>
              <input type="checkbox" checked={form.enabled === 1} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked ? 1 : 0 }))}
                style={{ width: 14, height: 14, accentColor: '#e8353a' }} />
              Activo
            </label>
            <button onClick={save} disabled={loading} style={{ background: '#e8353a', color: '#fff', border: 'none', padding: '9px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={cancelForm} style={{ background: 'none', border: '1px solid #333', color: '#777', padding: '9px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Ads list */}
      <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 100px 80px 70px 70px 150px', gap: 0, padding: '10px 16px', borderBottom: '1px solid #1a1a1a' }}>
          {['Aviso', 'Ubicación', 'Tipo', 'Impres.', 'Clicks', 'CTR', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444' }}>{h}</span>
          ))}
        </div>
        {ads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13 }}>Sin avisos configurados. Creá el primero para activar la publicidad.</div>
        ) : ads.map(a => (
          <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 100px 80px 70px 70px 150px', gap: 0, padding: '13px 16px', borderBottom: '1px solid #111', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 500 }}>{a.name}</div>
              <div style={{ fontSize: 10, color: '#444', marginTop: 2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 250 }}>
                {a.content.slice(0, 60)}{a.content.length > 60 ? '...' : ''}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#666' }}>{placementLabel(a.placement)}</span>
            <span style={{ fontSize: 11, color: '#666' }}>{a.type}</span>
            <span style={{ fontSize: 13, color: '#888', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600 }}>{a.impressions.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: '#888', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600 }}>{a.clicks.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: '#888' }}>{ctr(a)}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => toggleEnabled(a)} style={{
                fontSize: 10, padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontWeight: 700, letterSpacing: .5,
                background: a.enabled ? 'rgba(74,222,128,.1)' : 'rgba(100,100,100,.1)',
                border: `1px solid ${a.enabled ? 'rgba(74,222,128,.3)' : '#2a2a2a'}`,
                color: a.enabled ? '#4ade80' : '#555',
              }}>
                {a.enabled ? 'Activo' : 'Inactivo'}
              </button>
              <button onClick={() => startEdit(a)} style={{ fontSize: 11, padding: '4px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', cursor: 'pointer', borderRadius: 3 }}>Editar</button>
              <button onClick={() => deleteAd(a.id)} style={{ fontSize: 11, padding: '4px 8px', background: 'none', border: '1px solid #2a1a1a', color: '#773333', cursor: 'pointer', borderRadius: 3 }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
