'use client';
import { useState, useEffect } from 'react';

interface Source { id: number; source_name: string; rss_url: string; enabled: number; auto_publish: number; category: string; last_run: string | null; articles_added: number; }
interface RunResult { source: string; added: number; errors: string[]; }

export default function AutoPublishPage() {
  const [sources, setSources]     = useState<Source[]>([]);
  const [running, setRunning]     = useState(false);
  const [lastResult, setLast]     = useState<RunResult[] | null>(null);
  const [noApiKey, setNoApiKey]   = useState(false);

  useEffect(() => {
    fetch('/api/cms/scraper/settings').then(r => r.json()).then((d: { settings?: Source[] }) => setSources(d.settings || [])).catch(() => {});
    setNoApiKey(!process.env.NEXT_PUBLIC_HAS_AI);
  }, []);

  async function runScraper(sourceId?: number) {
    setRunning(true); setLast(null);
    const res = await fetch('/api/cms/scraper/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sourceId != null ? { source_id: sourceId } : {}),
    });
    const data = await res.json() as { totalAdded?: number; results?: RunResult[] };
    setLast(data.results || []);
    setRunning(false);
    fetch('/api/cms/scraper/settings').then(r => r.json()).then((d: { settings?: Source[] }) => setSources(d.settings || [])).catch(() => {});
  }

  async function toggleSource(id: number, field: 'enabled' | 'auto_publish', value: number) {
    await fetch('/api/cms/scraper/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: value }) });
    setSources(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>IA Auto-publicación</h1>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Scrapeá portales deportivos, reescribí con IA y publicá automáticamente</p>
      </div>

      {/* AI status banner */}
      <div style={{ background: 'rgba(232,53,58,.08)', border: '1px solid rgba(232,53,58,.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#aaa' }}>
        <strong style={{ color: '#e8353a' }}>IA (Claude)</strong> — Para habilitar la reescritura automática, agregá <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 3, color: '#e8353a' }}>ANTHROPIC_API_KEY</code> en tus variables de Railway.
        Sin la clave, las notas se importan con el contenido original (sin reescribir). <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: '#e8353a' }}>Obtener clave →</a>
      </div>

      {/* Run all button */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <button onClick={() => runScraper()} disabled={running}
          style={{ background: running ? '#333' : '#e8353a', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: running ? 'wait' : 'pointer' }}>
          {running ? '⏳ Ejecutando...' : '▶ Ejecutar todos los scrapers'}
        </button>
        <span style={{ fontSize: 12, color: '#555' }}>Se guardan como borrador (o publican si activás &quot;Auto-publicar&quot;)</span>
      </div>

      {/* Results */}
      {lastResult && (
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, padding: '16px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Resultado de la última ejecución</h3>
          {lastResult.map((r, i) => (
            <div key={i} style={{ marginBottom: 8, fontSize: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: r.added > 0 ? '#4ade80' : '#666', minWidth: 100 }}>{r.source}</span>
              <span style={{ color: '#aaa' }}>{r.added} artículo{r.added !== 1 ? 's' : ''} importado{r.added !== 1 ? 's' : ''}</span>
              {r.errors.length > 0 && <span style={{ color: '#e8353a', fontSize: 10 }}>{r.errors.length} errores</span>}
            </div>
          ))}
        </div>
      )}

      {/* Sources table */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Fuentes configuradas</span>
        </div>
        {sources.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #171717', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{s.source_name}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{s.rss_url}</div>
              {s.last_run && <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>Última vez: {new Date(s.last_run).toLocaleString('es-AR')} · {s.articles_added} total</div>}
            </div>

            <select value={s.category} onChange={async e => {
              await fetch('/api/cms/scraper/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, category: e.target.value }) });
              setSources(prev => prev.map(x => x.id === s.id ? { ...x, category: e.target.value } : x));
            }} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
              {['futbol','argentina','internacional','champions','libertadores','editorial'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!s.enabled} onChange={e => toggleSource(s.id, 'enabled', e.target.checked ? 1 : 0)}
                style={{ accentColor: '#e8353a', width: 14, height: 14 }} />
              Activo
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!s.auto_publish} onChange={e => toggleSource(s.id, 'auto_publish', e.target.checked ? 1 : 0)}
                style={{ accentColor: '#4ade80', width: 14, height: 14 }} />
              Auto-publicar
            </label>

            <button onClick={() => runScraper(s.id)} disabled={running} style={{ padding: '6px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
              ▶ Ejecutar
            </button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '20px', marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Automatización 24/7 — Railway Cron</h3>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 10px', lineHeight: 1.6 }}>Para ejecutar el scraper automáticamente (por ejemplo cada hora), configurá un cron job en Railway:</p>
        <ol style={{ fontSize: 12, color: '#888', paddingLeft: 20, margin: 0, lineHeight: 2 }}>
          <li>En Railway, andá a tu servicio → <strong style={{ color: '#aaa' }}>Settings → Cron</strong></li>
          <li>Agregá un nuevo cron con el schedule: <code style={{ background: '#1a1a1a', padding: '2px 8px', borderRadius: 3, color: '#e8353a' }}>0 * * * *</code> (cada hora)</li>
          <li>URL: <code style={{ background: '#1a1a1a', padding: '2px 8px', borderRadius: 3, color: '#e8353a' }}>https://golesnews-production.up.railway.app/api/cms/scraper/run</code></li>
          <li>Método: <code style={{ background: '#1a1a1a', padding: '2px 8px', borderRadius: 3, color: '#e8353a' }}>POST</code></li>
        </ol>
      </div>
    </div>
  );
}
