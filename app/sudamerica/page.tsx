'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import { LEAGUES } from '@/lib/football-api';
import { STATIC_STANDINGS, STATIC_SCORERS, SR, StaticScorer, StaticFixture } from '@/lib/static-standings';

type Fixture     = StaticFixture;
type StandingRow = SR;
type Scorer      = StaticScorer;

const LEAGUES_CONFIG = [
  {
    id: LEAGUES.LIBERTADORES, label: 'Copa Libertadores 2026', flag: '🌎', anchor: 'libertadores',
    note: 'Fecha 5/6 disputada — Última jornada semana del 27/05',
  },
  {
    id: LEAGUES.SUDAMERICANA, label: 'Copa Sudamericana 2026', flag: '🌍', anchor: 'sudamericana',
    note: 'Fecha 5/6 disputada',
  },
];

function SudaLeague({ leagueId, title, flag, anchor, note }: {
  leagueId: number; title: string; flag: string; anchor: string; note: string;
}) {
  const [fixtures,   setFixtures]   = useState<Fixture[]>([]);
  const [standings,  setStandings]  = useState<StandingRow[][]>(STATIC_STANDINGS[leagueId] ?? []);
  const [leagueLogo, setLeagueLogo] = useState('');
  const [scorers,    setScorers]    = useState<Scorer[]>(STATIC_SCORERS[leagueId] ?? []);
  const [tab, setTab]  = useState<'tabla' | 'fixture' | 'goleadores'>('tabla');
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    fetch(`/api/football/fixtures?league=${leagueId}`)
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

  return (
    <section id={anchor} style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 28 }}>{flag}</span>
        {leagueLogo && <Image src={leagueLogo} alt={title} width={34} height={34} style={{ objectFit: 'contain' }} />}
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>
          {title}
        </h2>
      </div>
      {!fromApi && (
        <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
          📊 {note} — Datos al 25/05/2026
        </p>
      )}
      <div style={{ marginBottom: 12, fontSize: 10, color: 'var(--text3)' }}>
        🟡 <strong style={{ color: 'var(--gold)' }}>1º</strong> clasifica directo a Octavos ·
        🔵 <strong style={{ color: '#1976d2' }}>2º</strong> va al Playoff ·
        Los demás eliminados
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
        {(['tabla', 'fixture', 'goleadores'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase',
            color: tab === t ? 'var(--red)' : 'var(--text3)',
            borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {t === 'tabla' ? 'Grupos / Tabla' : t === 'fixture' ? 'Resultados & Fixture' : 'Goleadores'}
          </button>
        ))}
      </div>

      {tab === 'tabla' && (
        <div>
          {standings.length === 0 ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
              Tabla no disponible
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 10 }}>
              {standings.map((group, i) => (
                <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div style={{ padding: '6px 12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: .5 }}>
                    {group[0]?.group ?? `Grupo ${String.fromCharCode(64 + i + 1)}`}
                  </div>
                  <StandingsTable standings={group} showForm={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'fixture' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
          {fixtures.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text3)', fontSize: 12 }}>Sin partidos disponibles en este momento</div>
          ) : fixtures.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
        </div>
      )}

      {tab === 'goleadores' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {scorers.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Sin datos disponibles</div>
          ) : scorers.slice(0, 15).map((sc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', width: 20, textAlign: 'center' }}>{i + 1}</span>
              {sc.player.photo && <Image src={sc.player.photo} alt={sc.player.name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{sc.player.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{sc.statistics[0]?.team?.name}</div>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>
                {sc.statistics[0]?.goals?.total ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SudamericaPage() {
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, letterSpacing: -2, color: '#fff' }}>
          FÚTBOL <span style={{ color: 'var(--red)' }}>SUDAMERICANO</span>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Copa Libertadores 2026 · Copa Sudamericana 2026</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {LEAGUES_CONFIG.map(l => (
          <a key={l.id} href={`#${l.anchor}`}
            style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', border: '1px solid var(--border2)', background: 'var(--bg2)', color: 'var(--text2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{l.flag}</span>{l.label}
          </a>
        ))}
      </div>

      {LEAGUES_CONFIG.map(l => (
        <SudaLeague key={l.id} leagueId={l.id} title={l.label} flag={l.flag} anchor={l.anchor} note={l.note} />
      ))}
    </div>
  );
}
