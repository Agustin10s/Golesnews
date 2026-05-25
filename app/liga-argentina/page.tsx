'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import SectionHeader from '../components/SectionHeader';
import { LEAGUES } from '@/lib/football-api';

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; country: string; round?: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

interface StandingRow {
  rank: number; team: { id: number; name: string; logo: string }; points: number;
  goalsDiff: number; form: string; description?: string | null; group?: string;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

const SECTIONS = [
  { id: LEAGUES.LIGA_PROFESIONAL,  label: 'Liga Profesional Argentina', anchor: 'liga' },
  { id: LEAGUES.PRIMERA_NACIONAL,  label: 'Liga B Nacional',            anchor: 'ligab' },
  { id: LEAGUES.COPA_ARGENTINA,    label: 'Copa Argentina',             anchor: 'copa' },
];

function LeagueSection({ leagueId, title, anchor }: { leagueId: number; title: string; anchor: string }) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<StandingRow[][]>([]);
  const [leagueInfo, setLeagueInfo] = useState<{ name: string; logo: string } | null>(null);
  const [scorers, setScorers] = useState<{ player: { name: string; photo: string }; statistics: [{ team: { name: string }; goals: { total: number | null } }] }[]>([]);
  const [tab, setTab] = useState<'tabla' | 'fixture' | 'goleadores'>('tabla');

  useEffect(() => {
    // Fixtures
    fetch(`/api/football/fixtures?league=${leagueId}&next=10`)
      .then(r => r.json()).then(d => setFixtures(d.fixtures || [])).catch(() => {});

    // Standings
    fetch(`/api/football/standings?league=${leagueId}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setStandings(d.data.standings || []);
          setLeagueInfo(d.data.league || null);
        }
      }).catch(() => {});

    // Scorers
    fetch(`/api/football/scorers?league=${leagueId}`)
      .then(r => r.json()).then(d => setScorers(d.scorers || [])).catch(() => {});
  }, [leagueId]);

  return (
    <section id={anchor} style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {leagueInfo?.logo && <Image src={leagueInfo.logo} alt={title} width={32} height={32} style={{ objectFit: 'contain' }} />}
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
        {(['tabla', 'fixture', 'goleadores'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase',
            color: tab === t ? 'var(--red)' : 'var(--text3)',
            borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {t === 'tabla' ? 'Tabla' : t === 'fixture' ? 'Próximos Partidos' : 'Goleadores'}
          </button>
        ))}
      </div>

      {tab === 'tabla' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {standings.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Tabla no disponible</div>
          ) : standings.map((group, i) => (
            <div key={i}>
              {standings.length > 1 && (
                <div style={{ padding: '6px 12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
                  {group[0]?.group || `Grupo ${i+1}`}
                </div>
              )}
              <StandingsTable standings={group} showForm />
            </div>
          ))}
        </div>
      )}

      {tab === 'fixture' && (
        <div>
          {fixtures.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Sin partidos disponibles</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
              {fixtures.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'goleadores' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {scorers.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Sin datos disponibles</div>
          ) : scorers.slice(0, 15).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', width: 20, textAlign: 'center' }}>{i + 1}</span>
              {s.player.photo && <Image src={s.player.photo} alt={s.player.name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.player.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{s.statistics[0]?.team?.name}</div>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>
                {s.statistics[0]?.goals?.total ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LigaArgentinaPage() {
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, letterSpacing: -2, color: '#fff' }}>
          FÚTBOL <span style={{ color: 'var(--red)' }}>ARGENTINO</span>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Liga Profesional · Liga B Nacional · Copa Argentina</p>
      </div>

      {/* Quick nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <a key={s.id} href={`#${s.anchor}`}
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.3px', padding: '6px 14px', border: '1px solid var(--border2)', background: 'var(--bg2)', color: 'var(--text2)', textDecoration: 'none', transition: 'all .15s' }}>
            {s.label}
          </a>
        ))}
      </div>

      {SECTIONS.map(s => (
        <LeagueSection key={s.id} leagueId={s.id} title={s.label} anchor={s.anchor} />
      ))}
    </div>
  );
}
