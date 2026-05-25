'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { formatMatchTime, formatMatchDate, getStatusLabel, isLive, isFinished, groupFixturesByDate, formatDateHeader } from '@/lib/utils';
import { LEAGUES } from '@/lib/football-api';

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; country: string; round?: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

const LEAGUE_TABS = [
  { id: 0,                           label: 'Todos' },
  { id: LEAGUES.LIGA_PROFESIONAL,    label: 'LPF' },
  { id: LEAGUES.PRIMERA_NACIONAL,    label: 'Liga B' },
  { id: LEAGUES.COPA_ARGENTINA,      label: 'Copa ARG' },
  { id: LEAGUES.LIBERTADORES,        label: 'Libertadores' },
  { id: LEAGUES.SUDAMERICANA,        label: 'Sudamericana' },
  { id: LEAGUES.CHAMPIONS_LEAGUE,    label: 'Champions' },
  { id: LEAGUES.EUROPA_LEAGUE,       label: 'Europa Lg.' },
  { id: LEAGUES.PREMIER_LEAGUE,      label: 'Premier' },
  { id: LEAGUES.LALIGA,              label: 'La Liga' },
  { id: LEAGUES.SERIE_A,             label: 'Serie A' },
  { id: LEAGUES.LIGA_MX,             label: 'Liga MX' },
  { id: LEAGUES.MLS,                 label: 'MLS' },
  { id: LEAGUES.WORLD_CUP,           label: 'Mundial 2026' },
];

export default function FixturePage() {
  const [activeLeague, setActiveLeague] = useState(0);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const url = activeLeague === 0
      ? '/api/football/fixtures?section=all-upcoming'
      : `/api/football/fixtures?league=${activeLeague}&next=20`;

    fetch(url)
      .then(r => r.json())
      .then(d => { setFixtures(d.fixtures || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeLeague]);

  useEffect(() => { load(); }, [load]);

  const grouped = groupFixturesByDate(fixtures);
  const dates = Object.keys(grouped).sort();

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, letterSpacing: -1, color: '#fff', marginBottom: 16 }}>
        FIXTURE
      </h1>

      {/* League filter tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
        {LEAGUE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLeague(tab.id)}
            style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '.3px', padding: '5px 11px',
              border: `1px solid ${activeLeague === tab.id ? 'var(--red)' : 'var(--border2)'}`,
              background: activeLeague === tab.id ? 'var(--red)' : 'var(--bg2)',
              color: activeLeague === tab.id ? '#fff' : 'var(--text2)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border2)', borderTopColor: 'var(--red)', borderRadius: '50%' }} />
        </div>
      ) : fixtures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, color: 'var(--text2)', marginBottom: 8 }}>Sin partidos disponibles</div>
          <div style={{ fontSize: 12 }}>Verificá la API key en .env.local</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
          <div>
            {dates.map(date => (
              <div key={date} style={{ marginBottom: 24 }}>
                <div style={{ padding: '6px 0', marginBottom: 10, borderBottom: '1px solid var(--border2)' }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
                    {formatDateHeader(date)}
                  </span>
                </div>

                {grouped[date].map((f) => {
                  const live = isLive(f.fixture.status);
                  const finished = isFinished(f.fixture.status);

                  return (
                    <div
                      key={f.fixture.id}
                      style={{
                        display: 'flex', alignItems: 'center', background: live ? 'rgba(232,53,58,.04)' : 'var(--bg2)',
                        border: `1px solid ${live ? 'rgba(232,53,58,.25)' : 'var(--border)'}`,
                        padding: '10px 14px', marginBottom: 4, gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: 130, flexShrink: 0 }}>
                        {f.league.logo && <Image src={f.league.logo} alt="" width={14} height={14} style={{ objectFit: 'contain' }} />}
                        <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.league.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: 13, fontWeight: live || finished && (f.goals.home ?? 0) > (f.goals.away ?? 0) ? 600 : 400 }}>
                            {f.teams.home.name}
                          </span>
                          {f.teams.home.logo && <Image src={f.teams.home.logo} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />}
                        </div>

                        <div style={{ textAlign: 'center', width: 80, flexShrink: 0 }}>
                          {live || finished ? (
                            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>
                              {f.goals.home ?? 0} - {f.goals.away ?? 0}
                            </div>
                          ) : (
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>
                              {formatMatchTime(f.fixture.date)}
                            </div>
                          )}
                          <div style={{ fontSize: 9, fontWeight: 700, color: live ? 'var(--red)' : 'var(--text3)' }}>
                            {live ? getStatusLabel(f.fixture.status) : finished ? 'Final' : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                          {f.teams.away.logo && <Image src={f.teams.away.logo} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />}
                          <span style={{ fontSize: 13, fontWeight: live || finished && (f.goals.away ?? 0) > (f.goals.home ?? 0) ? 600 : 400 }}>
                            {f.teams.away.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar info */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '14px', height: 'fit-content', position: 'sticky', top: 72 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
              Ligas Seguidas
            </div>
            {LEAGUE_TABS.slice(1).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveLeague(tab.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '7px 0',
                  background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                  color: activeLeague === tab.id ? 'var(--red)' : 'var(--text2)',
                  cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
