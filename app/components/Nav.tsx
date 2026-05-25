'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/en-vivo', label: '● EN VIVO', live: true },
  { href: '/fixture', label: 'Fixture' },
  { href: '/tablas', label: 'Tablas' },
  { href: '/liga-argentina', label: 'Argentina' },
  { href: '/sudamerica', label: 'Sudamérica' },
  { href: '/europa', label: 'Europa' },
  { href: '/americas', label: 'MLS' },
  { href: '/mundial-2026', label: 'Mundial 2026' },
];

export default function Nav() {
  const pathname = usePathname();
  const [nlOpen, setNlOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);

  async function subscribe() {
    if (!email) return;
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      setDone(true);
    } catch { setDone(true); }
  }

  return (
    <>
      <nav style={{ background: '#000', borderBottom: '3px solid var(--red)', position: 'sticky', top: 0, zIndex: 400 }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', alignItems: 'center', height: 54, padding: '0 1rem' }}>
          <Link href="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -1, flexShrink: 0, marginRight: 20, textDecoration: 'none' }}>
            Goles<span style={{ color: 'var(--red)' }}>News</span>
          </Link>

          <div style={{ display: 'flex', overflow: 'hidden', overflowX: 'auto', gap: 0, flex: 1 }} className="hide-scrollbar">
            {LINKS.map(l => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 11, fontWeight: 500, letterSpacing: '.5px', textTransform: 'uppercase',
                    color: l.live ? 'var(--red)' : active ? '#fff' : 'var(--text3)',
                    padding: '0 12px', height: 54, display: 'inline-flex', alignItems: 'center',
                    borderBottom: active ? '3px solid var(--red)' : '3px solid transparent',
                    whiteSpace: 'nowrap', textDecoration: 'none', transition: 'all .15s',
                    background: active ? 'rgba(255,255,255,.03)' : 'none',
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={() => setNlOpen(true)}
              style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Newsletter
            </button>
          </div>
        </div>
      </nav>

      {nlOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}
          onClick={(e) => { if (e.target === e.currentTarget) setNlOpen(false); }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', maxWidth: 400, width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setNlOpen(false)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text3)' }}>×</button>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              GOLES<span style={{ color: 'var(--red)' }}>NEWS</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>Resultados, goles y noticias del fútbol que seguís. Gratis.</p>
            {!done ? (
              <>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: '#fff', padding: '8px 11px', fontSize: 12, outline: 'none', marginBottom: 7, display: 'block' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu email" style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: '#fff', padding: '8px 11px', fontSize: 12, outline: 'none', marginBottom: 7, display: 'block' }} />
                <button onClick={subscribe} style={{ width: '100%', background: 'var(--red)', color: '#fff', border: 'none', padding: 11, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>Suscribirme gratis</button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '18px 0' }}>
                <div style={{ fontSize: 32, color: 'var(--green)', marginBottom: 7 }}>✓</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>¡Suscripto!</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
