'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LiveFixture {
  fixture: { id: number; status: { elapsed: number | null; short: string } };
  league: { id: number; name: string; logo: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

export default function LiveBar() {
  const [fixtures, setFixtures] = useState<LiveFixture[]>([]);

  const load = useCallback(() => {
    fetch('/api/football/live')
      .then(r => r.json())
      .then(d => setFixtures(d.fixtures || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
      <div style={{ display: 'flex', padding: '0 1rem', alignItems: 'stretch', minWidth: 'max-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px 0 0', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--red)', flexShrink: 0, borderRight: '1px solid var(--border)' }}>
          <span className="live-dot" />
          EN VIVO
        </div>

        {fixtures.length === 0 ? (
          <div style={{ padding: '10px 16px', fontSize: 11, color: 'var(--text3)' }}>
            No hay partidos en vivo ahora
          </div>
        ) : (
          fixtures.map(f => (
            <Link
              key={f.fixture.id}
              href={`/en-vivo#${f.fixture.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderRight: '1px solid var(--border)', cursor: 'pointer', transition: 'background .15s', flexShrink: 0, textDecoration: 'none', color: 'inherit' }}
            >
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>
                  {f.league.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {f.teams.home.logo && (
                    <Image src={f.teams.home.logo} alt={f.teams.home.name} width={16} height={16} style={{ objectFit: 'contain' }} />
                  )}
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{f.teams.home.name}</span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>
                    {f.goals.home ?? 0}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', padding: '0 3px' }}>-</span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>
                    {f.goals.away ?? 0}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{f.teams.away.name}</span>
                  {f.teams.away.logo && (
                    <Image src={f.teams.away.logo} alt={f.teams.away.name} width={16} height={16} style={{ objectFit: 'contain' }} />
                  )}
                  <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, padding: '1px 5px', background: 'rgba(232,53,58,.12)', borderRadius: 2 }}>
                    {f.fixture.status.elapsed}'
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
