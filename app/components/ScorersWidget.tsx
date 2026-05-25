'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LEAGUES } from '@/lib/football-api';

interface Scorer {
  player: { id: number; name: string; photo: string; nationality: string };
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    goals: { total: number | null; assists: number | null };
  }>;
}

export default function ScorersWidget() {
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/football/scorers?league=${LEAGUES.LIGA_PROFESIONAL}`)
      .then(r => r.json())
      .then(d => { setScorers(d.scorers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <div style={{ padding: '9px 13px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Goleadores LPF
        </span>
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--border2)', borderTopColor: 'var(--red)', borderRadius: '50%', margin: '0 auto' }} />
        </div>
      ) : scorers.length === 0 ? (
        <div style={{ padding: 16, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>Sin datos disponibles</div>
      ) : (
        scorers.slice(0, 8).map((s, i) => {
          const stat = s.statistics[0];
          return (
            <div key={s.player.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text3)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                {i + 1}
              </span>
              {s.player.photo && (
                <Image src={s.player.photo} alt={s.player.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.player.name}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{stat?.team?.name}</div>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>
                {stat?.goals?.total ?? 0}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
