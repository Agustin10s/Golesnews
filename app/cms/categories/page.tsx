'use client';
import { useEffect, useState } from 'react';

interface Category { id: number; slug: string; label: string; color: string; ord: number; }

const LABEL_STYLE: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1,
  textTransform: 'uppercase', color: '#555', marginBottom: 5,
};
const INPUT_STYLE: React.CSSProperties = {
  width: '100%', background: '#111', border: '1px solid #222',
  color: '#e0e0e0', padding: '9px 11px', fontSize: 13,
  outline: 'none', boxSizing: 'border-box', borderRadius: 4,
};

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ slug: '', label: '', color: '#e8353a', ord: 0 });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const d = await fetch('/api/cms/categories').then(r => r.json()) as { categories: Category[] };
    setCats(d.categories ?? []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(c: Category) {
    setEditing(c);
    setForm({ slug: c.slug, label: c.label, color: c.color, ord: c.ord });
  }
  function startNew() {
    setEditing(null);
    setForm({ slug: '', label: '', color: '#e8353a', ord: (cats[cats.length - 1]?.ord ?? 0) + 1 });
  }
  function cancelForm() { setEditing(null); setForm({ slug: '', label: '', color: '#e8353a', ord: 0 }); }

  async function save() {
    if (!form.slug || !form.label) { setMsg('Slug y nombre son requeridos'); return; }
    setLoading(true); setMsg('');
    if (editing) {
      await fetch('/api/cms/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) });
    } else {
      await fetch('/api/cms/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setLoading(false);
    cancelForm();
    setMsg('Guardado correctamente');
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  async function deleteCat(id: number) {
    if (!confirm('Eliminar esta categoría?')) return;
    await fetch(`/api/cms/categories?id=${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Categorías</h1>
          <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0' }}>Gestión de categorías del sitio</p>
        </div>
        <button onClick={startNew} style={{ background: '#e8353a', color: '#fff', border: 'none', padding: '10px 20px', fontSize: 12, fontWeight: 700, letterSpacing: .5, cursor: 'pointer', borderRadius: 4 }}>
          + Nueva categoría
        </button>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', color: '#4ade80', fontSize: 13, borderRadius: 4 }}>{msg}</div>}

      {/* Form */}
      {(editing !== null || form.label !== '' || form.slug !== '') && (
        <div style={{ background: '#0e0e0e', border: '1px solid #222', padding: 20, marginBottom: 20, borderRadius: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 80px', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={LABEL_STYLE}>Nombre *</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Fútbol" style={INPUT_STYLE} />
            </div>
            <div>
              <label style={LABEL_STYLE}>Slug *</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="futbol" style={INPUT_STYLE} />
            </div>
            <div>
              <label style={LABEL_STYLE}>Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: 40, height: 36, padding: 2, background: '#111', border: '1px solid #222', cursor: 'pointer', borderRadius: 4 }} />
                <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ ...INPUT_STYLE, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE}>Orden</label>
              <input type="number" value={form.ord} onChange={e => setForm(f => ({ ...f, ord: Number(e.target.value) }))} style={INPUT_STYLE} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={save} disabled={loading} style={{ background: '#e8353a', color: '#fff', border: 'none', padding: '9px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={cancelForm} style={{ background: 'none', border: '1px solid #333', color: '#777', padding: '9px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 100px 60px 120px', gap: 0, padding: '10px 16px', borderBottom: '1px solid #1a1a1a' }}>
          {['#', 'Nombre', 'Slug', 'Color', 'Orden', 'Acciones'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444' }}>{h}</span>
          ))}
        </div>
        {cats.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: 13 }}>Sin categorías. Creá una para comenzar.</div>
        ) : cats.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 100px 60px 120px', gap: 0, padding: '12px 16px', borderBottom: '1px solid #141414', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#444' }}>{c.id}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 500 }}>{c.label}</span>
            </span>
            <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>{c.slug}</span>
            <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>{c.color}</span>
            <span style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>{c.ord}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(c)} style={{ fontSize: 11, padding: '5px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', cursor: 'pointer', borderRadius: 3 }}>
                Editar
              </button>
              <button onClick={() => deleteCat(c.id)} style={{ fontSize: 11, padding: '5px 10px', background: 'none', border: '1px solid #2a1a1a', color: '#773333', cursor: 'pointer', borderRadius: 3 }}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
