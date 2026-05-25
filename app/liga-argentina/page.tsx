'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import { LEAGUES } from '@/lib/football-api';
import {
  STATIC_STANDINGS, STATIC_SCORERS, STATIC_FIXTURES,
  SR, StaticScorer, StaticFixture,
} from '@/lib/static-standings';

type Fixture = StaticFixture;
type StandingRow = SR;
type Scorer = StaticScorer;

const SECTIONS = [
  { id: LEAGUES.LIGA_PROFESIONAL, label: 'Liga Profesional Argentina', anchor: 'liga', badge: '🏆 Apertura 2026' },
  { id: LEAGUES.PRIMERA_NACIONAL, label: 'Primera Nacional',           anchor: 'ligab', badge: null },
  { id: LEAGUES.COPA_ARGENTINA,   label: 'Copa Argentina',             anchor: 'copa',  badge: '16avos de Final' },
];

function DataBadge({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
      background: 'rgba(232,53,58,.12)', color: 'var(--red)',
      border: '1px solid rgba(232,53,58,.25)', borderRadius: 3,
      padding: '2px 7px', marginLeft: 8,
    }}>{label}</span>
  );
}

function LeagueSection({
  leagueId, title, anchor, badge,
}: {
  leagueId: number; title: string; anchor: string; badge: string | null;
}) {
  const [fixtures,  setFixtures]  = useState<Fixture[]>(STATIC_FIXTURES[leagueId] ?? []);
  const [standings, setStandings] = useState<StandingRow[][]>(STATIC_STANDINGS[leagueId] ?? []);
  const [leagueInfo, setLeagueInfo] = useState<{ name: string; logo: string } | null>(null);
  const [scorers,   setScorers]   = useState<Scorer[]>(STATIC_SCORERS[leagueId] ?? []);
  const [tab, setTab] = useState<'tabla' | 'fixture' | 'goleadores'>('tabla');
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    fetch(`/api/football/fixtures?league=${leagueId}&next=10`)
      .then(r => r.json())
      .then(d => { if (d.fixtures?.length) setFixtures(d.fixtures); })
      .catch(() => {});

    fetch(`/api/football/standings?league=${leagueId}`)
      .then(r => r.json())
      .then(d => {
        if (d.data?.standings?.length) {
          setStandings(d.data.standings);
          setLeagueInfo(d.data.league ?? null);
          setFromApi(true);
        }
      })
      .catch(() => {});

    fetch(`/api/football/scorers?league=${leagueId}`)
      .then(r => r.json())
      .then(d => { if (d.scorers?.length) setScorers(d.scorers); })
      .catch(() => {});
  }, [leagueId]);

  return (
    <section id={anchor} style={{ marginBottom: 40 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        {leagueInfo?.logo && (
          <Image src={leagueInfo.logo} alt={title} width={32} height={32} style={{ objectFit: 'contain' }} />
        )}
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>
          {title}
        </h2>
        {badge && <DataBadge label={badge} />}
      </div>
      {!fromApi && (
        <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 10 }}>
          📊 Datos actualizados al 25/05/2026 — se actualizarán automáticamente cuando la API esté disponible
        </p>
      )}

      {/* Tabs */}
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

      {/* TABLA */}
      {tab === 'tabla' && (
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
          {standings.length > 0 && leagueId === LEAGUES.LIGA_PROFESIONAL && !fromApi && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 10, color: '#e8a020', background: 'rgba(232,160,32,.05)' }}>
              🟡 Clasificados playoffs · ⬇ Descenso/riesgo | Datos: Torneo Apertura 2026 — Campeón: <strong>Belgrano</strong>
            </div>
          )}
        </div>
      )}

      {/* FIXTURE */}
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

      {/* GOLEADORES */}
      {tab === 'goleadores' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {scorers.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Sin datos disponibles</div>
          ) : scorers.slice(0, 15).map((sc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text3)', width: 24, textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              {sc.player.photo && (
                <Image src={sc.player.photo} alt={sc.player.name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />
              )}
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

// ── Copa Argentina special banner ────────────────────────────
function CopaArgentinaBanner() {
  return (
    <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(232,53,58,.07)', border: '1px solid rgba(232,53,58,.2)', borderRadius: 6, fontSize: 11, color: 'var(--text2)' }}>
      🏆 <strong>Copa Argentina 2026</strong> — Fase actual: <strong>16avos de Final</strong>. Los partidos deben jugarse antes del inicio del Mundial FIFA (11 de junio).
    </div>
  );
}

export default function LigaArgentinaPage() {
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 1rem' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(36px,5vw,60px)', fontWeight: 800, letterSpacing: -2, color: '#fff' }}>
          FÚTBOL <span style={{ color: 'var(--red)' }}>ARGENTINO</span>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Liga Profesional · Primera Nacional · Copa Argentina</p>
      </div>

      {/* Quick nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <a key={s.id} href={`#${s.anchor}`}
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.3px', padding: '6px 14px', border: '1px solid var(--border2)', background: 'var(--bg2)', color: 'var(--text2)', textDecoration: 'none' }}>
            {s.label}
          </a>
        ))}
      </div>

      {/* Campeón Apertura 2026 banner */}
      <div style={{ marginBottom: 28, padding: '14px 18px', background: 'linear-gradient(135deg, rgba(232,53,58,.12), rgba(232,160,32,.08))', border: '1px solid rgba(232,53,58,.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 36 }}>🏆</span>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -.3 }}>
            CAMPEÓN APERTURA 2026: <span style={{ color: 'var(--gold)' }}>BELGRANO DE CÓRDOBA</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
            Final · 24 de mayo · Est. Kempes, Córdoba · <strong>River Plate 2–3 Belgrano</strong> · Primer título de Primera División en su historia
          </div>
        </div>
      </div>

      {SECTIONS.map(s => (
        <div key={s.id}>
          {s.id === LEAGUES.COPA_ARGENTINA && <CopaArgentinaBanner />}
          <LeagueSection leagueId={s.id} title={s.label} anchor={s.anchor} badge={s.badge} />
        </div>
      ))}
    </div>
  );
}
