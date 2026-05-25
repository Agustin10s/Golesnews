'use client';
import { useState, useEffect, useRef } from 'react';

interface Media { id: number; url: string; original_name: string; size: number; created_at: string; mime_type: string; }

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch('/api/cms/media/upload').then(r => r.json()).then((d: { media?: Media[] }) => setMedia(d.media || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      await fetch('/api/cms/media/upload', { method: 'POST', body: fd }).catch(() => {});
    }
    setUploading(false);
    load();
    e.target.value = '';
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(window.location.origin + url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Biblioteca de archivos</h1>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: '#e8353a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {uploading ? 'Subiendo...' : '⬆ Subir imágenes'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={upload} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files); if (files.length && fileRef.current) { const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); fileRef.current.files = dt.files; fileRef.current.dispatchEvent(new Event('change', { bubbles: true })); } }}
        style={{ border: '2px dashed #2a2a2a', borderRadius: 10, padding: '24px', textAlign: 'center', color: '#555', fontSize: 13, marginBottom: 20, cursor: 'pointer' }}
        onClick={() => fileRef.current?.click()}
      >
        Arrastrá imágenes aquí o hacé click para seleccionar
      </div>

      {media.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444', fontSize: 14 }}>No hay archivos subidos aún</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {media.map(m => (
            <div key={m.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.original_name} style={{ width: '100%', height: 130, objectFit: 'cover', background: '#1a1a1a' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }} title={m.original_name}>{m.original_name}</div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 8 }}>{formatSize(m.size)}</div>
                <button onClick={() => copyUrl(m.url)} style={{ width: '100%', padding: '5px', background: copied === m.url ? 'rgba(74,222,128,.1)' : '#1a1a1a', border: '1px solid #2a2a2a', color: copied === m.url ? '#4ade80' : '#888', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                  {copied === m.url ? '✅ Copiado' : 'Copiar URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: '#444', marginTop: 16 }}>
        ⚠ Las imágenes se guardan en /public/uploads/ del servidor. En Railway, configurá un volumen persistente o usá Cloudinary para producción.
      </p>
    </div>
  );
}
