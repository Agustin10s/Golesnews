'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { formatMatchTime, isLive, isFinished, getStatusLabel } from '@/lib/utils';

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; country: string; flag?: string; round?: string };
  teams: { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null } };
}

function LiveMatch({ f }: { f: Fixture }) {
  const live = isLive(f.fixture.status);
  const finished = isFinished(f.fixture.status);

  return (
    <div
      id={String(f.fixture.id)}
      style={{
        background: live ? 'rgba(232,53,58,.05)' : 'var(--bg2)',
        border: `1px solid ${live ? 'rgba(232,53,58,.3)' : 'var(--border)'}`,
        padding: '16px 20px',
        marginBottom: 8,
        transition: 'background .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {f.league.logo && <Image src={f.league.logo} alt={f.league.name} width={16} height={16} style={{ objectFit: 'contain' }} />}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>
          {f.league.name} {f.league.round ? `— ${f.league.round}` : ''}
        </span>
        {f.fixture.venue.name && (
          <span style={{ fontSize: 9, color: 'var(--text3)', marginLeft: 'auto' }}>
            {f.fixture.venue.name}, {f.fixture.venue.city}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {f.teams.home.logo && <Image src={f.teams.home.logo} alt={f.teams.home.name} width={48} height={48} style={{ objectFit: 'contain' }} />}
          <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{f.teams.home.name}</span>
        </div>

        <div style={{ textAlign: 'center', minWidth: 100 }}>
          {live || finished ? (
            <>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {f.goals.home ?? 0} — {f.goals.away ?? 0}
              </div>
              {f.score.halftime.home !== null && (
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>
                  (HT: {f.score.halftime.home}-{f.score.halftime.away})
                </div>
              )}
              <div style={{ marginTop: 6 }}>
                {live ? (
                  <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700, background: 'rgba(232,53,58,.12)', padding: '2px 8px', borderRadius: 2 }}>
                    {getStatusLabel(f.fixture.status)}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Final</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text2)' }}>
                {formatMatchTime(f.fixture.date)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                {new Date(f.fixture.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {f.teams.away.logo && <Image src={f.teams.away.logo} alt={f.teams.away.name} width={48} height={48} style={{ objectFit: 'contain' }} />}
          <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{f.teams.away.name}</span>
        </div>
      </div>
    </div>
  );
}

export default function EnVivoPage() {
  const [live, setLive] = useState<Fixture[]>([]);
  const [today, setToday] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/football/live').then(r => r.json()),
      fetch('/api/football/fixtures?section=all-today').then(r => r.json()),
    ]).then(([liveData, todayData]) => {
      setLive(liveData.fixtures || []);
      setToday(todayData.fixtures || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      fetch('/api/football/live').then(r => r.json()).then(d => setLive(d.fixtures || [])).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [load]);

  // Merge: live first, then scheduled
  const liveIds = new Set(live.map(f => f.fixture.id));
  const scheduled = today.filter(f => !liveIds.has(f.fixture.id) && !isFinished(f.fixture.status));
  const finished = today.filter(f => isFinished(f.fixture.status));

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, letterSpacing: -1, color: '#fff', marginBottom: 4 }}>
          <span style={{ color: 'var(--red)' }}>●</span> EN VIVO
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Resultados en tiempo real — actualización automática cada 60 segundos</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--red)', borderRadius: '50%' }} />
        </div>
      ) : (
        <>
          {live.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 9, borderBottom: '2px solid var(--border2)' }}>
                <span style={{ width: 4, height: 18, background: 'var(--red)', borderRadius: 2 }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>PARTIDOS EN VIVO</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 7px', background: 'var(--red)', color: '#fff' }}>{live.length} LIVE</span>
              </div>
              {live.map(f => <LiveMatch key={f.fixture.id} f={f} />)}
            </section>
          )}

          {scheduled.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 9, borderBottom: '2px solid var(--border2)' }}>
                <span style={{ width: 4, height: 18, background: 'var(--text3)', borderRadius: 2 }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>PRÓXIMOS HOY</span>
              </div>
              {scheduled.map(f => <LiveMatch key={f.fixture.id} f={f} />)}
            </section>
          )}

          {finished.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 9, borderBottom: '2px solid var(--border2)' }}>
                <span style={{ width: 4, height: 18, background: 'var(--text3)', borderRadius: 2 }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>FINALIZADOS HOY</span>
              </div>
              {finished.map(f => <LiveMatch key={f.fixture.id} f={f} />)}
            </section>
          )}

          {live.length === 0 && scheduled.length === 0 && finished.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, color: 'var(--text2)', marginBottom: 8 }}>No hay partidos hoy</div>
              <div style={{ fontSize: 13 }}>Revisá la API key en .env.local o volvé más tarde</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
