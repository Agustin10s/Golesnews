'use client';
import { useEffect, useState } from 'react';

interface TickerItem {
  text: string;
}

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([
    { text: 'GOLESNEWS — Fútbol en vivo, resultados y noticias en tiempo real' },
    { text: 'LIGA PROFESIONAL ARGENTINA — Seguí todos los partidos en vivo' },
    { text: 'CHAMPIONS LEAGUE — Resultados, fixture y tablas actualizadas' },
    { text: 'MUNDIAL 2026 — Grupos, fixture y resultados en tiempo real' },
    { text: 'PREMIER LEAGUE — Tabla, resultados y próximos partidos' },
  ]);

  useEffect(() => {
    // Try to load live fixture headlines
    fetch('/api/football/live')
      .then(r => r.json())
      .then(({ fixtures = [] }) => {
        if (fixtures.length === 0) return;
        const liveItems: TickerItem[] = fixtures.slice(0, 8).map((f: { league: { name: string }; teams: { home: { name: string }; away: { name: string } }; goals: { home: number | null; away: number | null }; fixture: { status: { elapsed: number | null } } }) => ({
          text: `EN VIVO: ${f.league.name} — ${f.teams.home.name} ${f.goals.home ?? 0}-${f.goals.away ?? 0} ${f.teams.away.name} (${f.fixture.status.elapsed || 0}')`
        }));
        setItems(prev => [...liveItems, ...prev]);
      })
      .catch(() => {});
  }, []);

  const doubled = [...items, ...items];

  return (
    <div style={{ background: 'var(--red)', height: 30, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div className="animate-ticker" style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', color: '#fff', padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ opacity: .4, fontSize: 9 }}>▶</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
