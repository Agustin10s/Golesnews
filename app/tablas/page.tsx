'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from '../components/StandingsTable';
import { LEAGUES } from '@/lib/football-api';
import { STATIC_STANDINGS, SR } from '@/lib/static-standings';

const LEAGUES_CONFIG = [
  // Argentina
  { id: LEAGUES.LIGA_PROFESIONAL,  label: 'Liga Profesional Argentina', flag: '🇦🇷', group: 'Argentina' },
  { id: LEAGUES.PRIMERA_NACIONAL,  label: 'Liga B Nacional',             flag: '🇦🇷', group: 'Argentina' },
  { id: LEAGUES.COPA_ARGENTINA,    label: 'Copa Argentina',              flag: '🇦🇷', group: 'Argentina' },
  // Sudamérica
  { id: LEAGUES.LIBERTADORES,      label: 'Copa Libertadores',           flag: '🌎', group: 'Sudamérica' },
  { id: LEAGUES.SUDAMERICANA,      label: 'Copa Sudamericana',           flag: '🌎', group: 'Sudamérica' },
  // Europa
  { id: LEAGUES.CHAMPIONS_LEAGUE,  label: 'UEFA Champions League',       flag: '🏆', group: 'Europa' },
  { id: LEAGUES.EUROPA_LEAGUE,     label: 'UEFA Europa League',          flag: '🇪🇺', group: 'Europa' },
  { id: LEAGUES.PREMIER_LEAGUE,    label: 'Premier League',              flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'Europa' },
  { id: LEAGUES.LALIGA,            label: 'La Liga',                     flag: '🇪🇸', group: 'Europa' },
  { id: LEAGUES.SERIE_A,           label: 'Serie A',                     flag: '🇮🇹', group: 'Europa' },
  // Américas
  { id: LEAGUES.MLS,               label: 'MLS',                         flag: '🇺🇸', group: 'Américas' },
  // Mundial
  { id: LEAGUES.WORLD_CUP,         label: 'Copa Mundial 2026',           flag: '🏆', group: 'Mundial' },
];

type StandingRow = SR;

interface LeagueData {
  league: { name: string; logo: string; season: number };
  standings: StandingRow[][];
}

export default function TablasPage() {
  const [activeLeague, setActiveLeague] = useState<number>(LEAGUES.LIGA_PROFESIONAL);
  const [cache, setCache] = useState<Record<number, LeagueData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cache[activeLeague]) return;
    setLoading(true);
    fetch(`/api/football/standings?league=${activeLeague}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) setCache(prev => ({ ...prev, [activeLeague]: d.data }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeLeague, cache]);

  const current = cache[activeLeague];
  const config  = LEAGUES_CONFIG.find(l => l.id === activeLeague);
  const staticGroups = STATIC_STANDINGS[activeLeague] ?? [];
  const fromApi = !!current;

  // Use API data if available, otherwise fall back to static
  const displayGroups: StandingRow[][] = fromApi
    ? current.standings
    : staticGroups;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, letterSpacing: -1, color: '#fff', marginBottom: 16 }}>
        TABLAS DE POSICIONES
      </h1>

      {/* League selector */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 5, marginBottom: 20, flexWrap: 'wrap' }}>
        {LEAGUES_CONFIG.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveLeague(l.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, letterSpacing: '.3px', padding: '6px 14px',
              border: `1px solid ${activeLeague === l.id ? 'var(--red)' : 'var(--border2)'}`,
              background: activeLeague === l.id ? 'var(--red)' : 'var(--bg2)',
              color: activeLeague === l.id ? '#fff' : 'var(--text2)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            <span>{l.flag}</span>
            {l.label}
          </button>
        ))}
      </div>

      {/* League header */}
      {fromApi && current.league ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Image src={current.league.logo} alt={current.league.name} width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>
              {current.league.name}
            </h2>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Temporada {current.league.season}</div>
          </div>
        </div>
      ) : config && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>{config.flag}</span>
          <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>
            {config.label}
          </h2>
        </div>
      )}

      {/* Static data notice */}
      {!fromApi && !loading && displayGroups.length > 0 && (
        <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 12 }}>
          📊 Datos al 25/05/2026 — se actualizarán automáticamente cuando la API esté disponible
        </p>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--border2)', borderTopColor: 'var(--red)', borderRadius: '50%' }} />
        </div>
      ) : displayGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, color: 'var(--text2)', marginBottom: 8 }}>Tabla no disponible</div>
          <div style={{ fontSize: 12 }}>Verificá la API key o volvé más tarde</div>
        </div>
      ) : (
        <div>
          {displayGroups.map((group, i) => (
            <div key={i} style={{ marginBottom: 24, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {displayGroups.length > 1 && (
                <div style={{ padding: '8px 12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold)' }}>
                    {group[0]?.group || `Grupo ${i + 1}`}
                  </span>
                </div>
              )}
              <StandingsTable standings={group} showForm={fromApi} />
            </div>
          ))}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 10, color: 'var(--text3)', padding: '8px 0' }}>
            <span><span style={{ color: 'var(--gold)' }}>■</span> Champions/Clasificación</span>
            <span><span style={{ color: '#1976d2' }}>■</span> Europa</span>
            <span><span style={{ color: 'var(--red)' }}>■</span> Descenso</span>
          </div>
        </div>
      )}
    </div>
  );
}
