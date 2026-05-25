'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from './StandingsTable';
import { LEAGUES } from '@/lib/football-api';

const TABS = [
  { id: LEAGUES.LIGA_PROFESIONAL, label: 'LPF' },
  { id: LEAGUES.PRIMERA_NACIONAL, label: 'Liga B' },
  { id: LEAGUES.PREMIER_LEAGUE, label: 'Premier' },
  { id: LEAGUES.LALIGA, label: 'LaLiga' },
  { id: LEAGUES.CHAMPIONS_LEAGUE, label: 'UCL' },
  { id: LEAGUES.LIBERTADORES, label: 'Libertad.' },
  { id: LEAGUES.MLS, label: 'MLS' },
];

interface StandingsData {
  league: { name: string; logo: string };
  standings: Array<Array<{
    rank: number;
    team: { id: number; name: string; logo: string };
    points: number;
    goalsDiff: number;
    form: string;
    description?: string | null;
    all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  }>>;
}

export default function StandingsWidget() {
  const [activeTab, setActiveTab] = useState<number>(LEAGUES.LIGA_PROFESIONAL);
  const [data, setData] = useState<Record<number, StandingsData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/football/standings?league=${activeTab}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setData(prev => ({ ...prev, [activeTab]: d.data }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  const current = data[activeTab];
  const standings = current?.standings?.[0] || [];

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 14 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: 6, textAlign: 'center', fontSize: 10, fontWeight: 600,
              letterSpacing: '.5px', textTransform: 'uppercase', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--red)' : 'var(--text3)',
              borderBottom: activeTab === tab.id ? '2px solid var(--red)' : '2px solid transparent',
              background: 'none', border: 'none',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {current?.league && (
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
          <Image src={current.league.logo} alt={current.league.name} width={18} height={18} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
            {current.league.name}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--border2)', borderTopColor: 'var(--red)', borderRadius: '50%', margin: '0 auto' }} />
        </div>
      ) : (
        <StandingsTable standings={standings.slice(0, 10)} compact showForm={false} />
      )}

      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
        <a href="/tablas" style={{ fontSize: 10, color: 'var(--text3)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Ver tabla completa →
        </a>
      </div>
    </div>
  );
}
