'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatMatchTime, isLive, isFinished, getStatusLabel } from '@/lib/utils';

interface CarouselFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { id: number; name: string; logo: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

export default function FixtureCarousel() {
  const [fixtures, setFixtures] = useState<CarouselFixture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch('/api/football/fixtures?section=all-upcoming')
      .then(r => r.json())
      .then(d => {
        setFixtures(d.fixtures || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Also load live
    fetch('/api/football/live')
      .then(r => r.json())
      .then(d => {
        if (d.fixtures?.length > 0) {
          setFixtures(prev => {
            const liveIds = new Set(d.fixtures.map((f: CarouselFixture) => f.fixture.id));
            const filtered = prev.filter(f => !liveIds.has(f.fixture.id));
            return [...d.fixtures, ...filtered];
          });
        }
      })
      .catch(() => {});
  }, [load]);

  if (loading) {
    return (
      <div style={{ overflowX: 'auto', padding: '12px 0' }}>
        <div style={{ display: 'flex', gap: 10, padding: '0 1rem' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ width: 160, height: 88, flexShrink: 0, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
        {fixtures.slice(0, 20).map((f) => {
          const live = isLive(f.fixture.status);
          const finished = isFinished(f.fixture.status);

          return (
            <Link
              key={f.fixture.id}
              href={`/en-vivo#${f.fixture.id}`}
              style={{
                display: 'flex', flexDirection: 'column', padding: '12px 16px', borderRight: '1px solid var(--border)',
                cursor: 'pointer', transition: 'background .15s', flexShrink: 0, textDecoration: 'none', color: 'inherit',
                background: live ? 'rgba(232,53,58,.04)' : 'transparent',
                minWidth: 160,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                {f.league.logo && (
                  <Image src={f.league.logo} alt={f.league.name} width={12} height={12} style={{ objectFit: 'contain' }} />
                )}
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                  {f.league.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  {f.teams.home.logo && (
                    <Image src={f.teams.home.logo} alt={f.teams.home.name} width={28} height={28} style={{ objectFit: 'contain' }} />
                  )}
                  <span style={{ fontSize: 10, color: 'var(--text2)', textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.teams.home.name}
                  </span>
                </div>

                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  {live || finished ? (
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
                      {f.goals.home ?? 0} - {f.goals.away ?? 0}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
                      {formatMatchTime(f.fixture.date)}
                    </div>
                  )}
                  {live && (
                    <div style={{ fontSize: 9, color: 'var(--red)', fontWeight: 700 }}>
                      {getStatusLabel(f.fixture.status)}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  {f.teams.away.logo && (
                    <Image src={f.teams.away.logo} alt={f.teams.away.name} width={28} height={28} style={{ objectFit: 'contain' }} />
                  )}
                  <span style={{ fontSize: 10, color: 'var(--text2)', textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.teams.away.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
