'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import { LEAGUES } from '@/lib/football-api';
import { STATIC_STANDINGS, STATIC_SCORERS, STATIC_FIXTURES, SR, StaticScorer, StaticFixture } from '@/lib/static-standings';

type Fixture    = StaticFixture;
type StandingRow = SR;
type Scorer      = StaticScorer;

const LEAGUES_CONFIG = [
  { id: LEAGUES.CHAMPIONS_LEAGUE, label: 'UEFA Champions League', flag: '🏆', anchor: 'champions',
    info: 'FINAL: Arsenal vs PSG · 30 mayo · Puskás Aréna, Budapest' },
  { id: LEAGUES.PREMIER_LEAGUE,   label: 'Premier League',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', anchor: 'premier', info: null },
  { id: LEAGUES.LALIGA,           label: 'La Liga',               flag: '🇪🇸', anchor: 'laliga',   info: null },
  { id: LEAGUES.SERIE_A,          label: 'Serie A',               flag: '🇮🇹', anchor: 'seriea',   info: null },
];

// ── Champions League static bracket ──────────────────────────
function ChampionsBracket() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '0 0 0 0' }}>
      {/* Final Banner */}
      <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04))', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
          🏆 GRAN FINAL — 30 de Mayo 2026 · Puskás Aréna, Budapest
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2 }}>ARSENAL</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Inglaterra</div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 900, color: 'var(--gold)', padding: '0 12px' }}>
            VS
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>🇫🇷</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 2 }}>PSG</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Francia</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text2)' }}>
          ⏰ Partido pendiente
        </div>
      </div>

      {/* Semifinals */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Semifinales</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
          {[
            { home: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Arsenal', away: '🇪🇸 Atlético Madrid', score: '2 – 1', note: 'Global', winner: true },
            { home: '🇫🇷 PSG', away: '🇩🇪 Bayern Munich', score: '6 – 5', note: 'Global', winner: true },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>{m.home}</span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--gold)', padding: '0 10px' }}>{m.score}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text2)' }}>{m.away}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>{m.note} · Clasificado a la Final</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cuartos */}
      <div style={{ padding: '12px 18px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Cuartos de Final (completados)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 6 }}>
          {[
            { m: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Arsenal',       vs: '⚪ Real Madrid',     r: 'Arsenal clasificó' },
            { m: '🇪🇸 Atlético Madrid', vs: '🔵 Inter Milano',    r: 'Atlético clasificó' },
            { m: '🇫🇷 PSG',             vs: '🔴 Bayern Munich',   r: 'PSG clasificó' },
            { m: '🇩🇪 Bayern Munich',   vs: '🔵 Bayer Leverkusen', r: 'Bayern clasificó' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '8px 12px', fontSize: 11 }}>
              <span style={{ color: '#fff', fontWeight: 500 }}>{m.m}</span>
              <span style={{ color: 'var(--text3)', margin: '0 6px' }}>vs</span>
              <span style={{ color: 'var(--text2)' }}>{m.vs}</span>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3 }}>→ {m.r}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EuroLeague({ leagueId, title, flag, anchor, info }: {
  leagueId: number; title: string; flag: string; anchor: string; info: string | null;
}) {
  const [fixtures,   setFixtures]   = useState<Fixture[]>([]);
  const [standings,  setStandings]  = useState<StandingRow[][]>(STATIC_STANDINGS[leagueId] ?? []);
  const [leagueLogo, setLeagueLogo] = useState('');
  const [scorers,    setScorers]    = useState<Scorer[]>(STATIC_SCORERS[leagueId] ?? []);
  const [tab, setTab]   = useState<'tabla' | 'fixture' | 'goleadores'>('tabla');
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    fetch(`/api/football/fixtures?league=${leagueId}&next=10`)
      .then(r => r.json()).then(d => { if (d.fixtures?.length) setFixtures(d.fixtures); }).catch(() => {});
    fetch(`/api/football/standings?league=${leagueId}`)
      .then(r => r.json())
      .then(d => {
        if (d.data?.standings?.length) {
          setStandings(d.data.standings);
          setLeagueLogo(d.data.league?.logo ?? '');
          setFromApi(true);
        }
      }).catch(() => {});
    fetch(`/api/football/scorers?league=${leagueId}`)
      .then(r => r.json()).then(d => { if (d.scorers?.length) setScorers(d.scorers); }).catch(() => {});
  }, [leagueId]);

  const isChampions = leagueId === LEAGUES.CHAMPIONS_LEAGUE;

  return (
    <section id={anchor} style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 26 }}>{flag}</span>
        {leagueLogo && <Image src={leagueLogo} alt={title} width={32} height={32} style={{ objectFit: 'contain' }} />}
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>
          {title}
        </h2>
      </div>
      {info && (
        <div style={{ marginBottom: 10, padding: '7px 12px', background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 5, fontSize: 11, color: 'var(--gold)' }}>
          🏆 {info}
        </div>
      )}
      {!fromApi && !isChampions && (
        <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 10 }}>
          📊 Datos actualizados al 25/05/2026 — se actualizarán automáticamente cuando la API esté disponible
        </p>
      )}

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
        {(['tabla', 'fixture', 'goleadores'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase',
            color: tab === t ? 'var(--red)' : 'var(--text3)',
            borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {t === 'tabla' ? (isChampions ? 'Bracket' : 'Tabla') : t === 'fixture' ? 'Fixture' : 'Goleadores'}
          </button>
        ))}
      </div>

      {tab === 'tabla' && (
        isChampions ? <ChampionsBracket /> : (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            {standings.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Tabla no disponible</div>
            ) : standings.map((group, i) => (
              <div key={i}>
                {standings.length > 1 && (
                  <div style={{ padding: '6px 12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
                    {group[0]?.group ?? `Grupo ${i + 1}`}
                  </div>
                )}
                <StandingsTable standings={group} showForm={fromApi} />
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'fixture' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
          {fixtures.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text3)', fontSize: 12 }}>Sin partidos disponibles</div>
          ) : fixtures.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
        </div>
      )}

      {tab === 'goleadores' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {scorers.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Sin datos disponibles</div>
          ) : scorers.slice(0, 10).map((sc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text3)', width: 24, textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              {sc.player.photo && <Image src={sc.player.photo} alt={sc.player.name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{sc.player.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{sc.statistics[0]?.team?.name}</div>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--red)' }}>
                {sc.statistics[0]?.goals?.total ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function EuropaPage() {
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, letterSpacing: -2, color: '#fff' }}>
          FÚTBOL <span style={{ color: 'var(--red)' }}>EUROPEO</span>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Champions League · Premier League · La Liga · Serie A</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {LEAGUES_CONFIG.map(l => (
          <a key={l.id} href={`#${l.anchor}`}
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.3px', padding: '6px 14px', border: '1px solid var(--border2)', background: 'var(--bg2)', color: 'var(--text2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{l.flag}</span> {l.label}
          </a>
        ))}
      </div>

      {LEAGUES_CONFIG.map(l => (
        <EuroLeague key={l.id} leagueId={l.id} title={l.label} flag={l.flag} anchor={l.anchor} info={l.info} />
      ))}
    </div>
  );
}
