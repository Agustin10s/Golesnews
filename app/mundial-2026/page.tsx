'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import { LEAGUES } from '@/lib/football-api';

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; round?: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

interface StandingRow {
  rank: number; team: { id: number; name: string; logo: string }; points: number;
  goalsDiff: number; form: string; description?: string | null; group?: string;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export default function MundialPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<StandingRow[][]>([]);
  const [leagueInfo, setLeagueInfo] = useState<{ name: string; logo: string } | null>(null);
  const [tab, setTab] = useState<'grupos' | 'fixture' | 'eliminatorias'>('grupos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/football/fixtures?league=${LEAGUES.WORLD_CUP}&next=30`).then(r => r.json()),
      fetch(`/api/football/standings?league=${LEAGUES.WORLD_CUP}`).then(r => r.json()),
    ]).then(([fxData, stData]) => {
      setFixtures(fxData.fixtures || []);
      if (stData.data) {
        setStandings(stData.data.standings || []);
        setLeagueInfo(stData.data.league || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Group fixtures by round
  const byRound = fixtures.reduce((acc, f) => {
    const r = f.league.round || 'Other';
    if (!acc[r]) acc[r] = [];
    acc[r].push(f);
    return acc;
  }, {} as Record<string, Fixture[]>);

  return (
    <div style={{ background: 'linear-gradient(135deg,#040810 0%,#0a1020 50%,#040c18 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 44 }}>🏆</span>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>
                MUNDIAL <span style={{ color: 'var(--gold)' }}>2026</span>
              </h1>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginTop: 4 }}>
                USA · CANADÁ · MÉXICO
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['48', 'Equipos'], ['104', 'Partidos'], ['16', 'Sedes'], ['Jun-Jul', '2026']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 20 }}>
          {(['grupos', 'fixture', 'eliminatorias'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase',
              color: tab === t ? 'var(--gold)' : 'var(--text3)',
              borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              {t === 'grupos' ? 'Grupos & Tablas' : t === 'fixture' ? 'Fixture' : 'Fase Final'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,.1)', borderTopColor: 'var(--gold)', borderRadius: '50%' }} />
          </div>
        ) : (
          <>
            {/* GRUPOS */}
            {tab === 'grupos' && (
              <div>
                {standings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, color: 'var(--text2)', marginBottom: 8 }}>Grupos no disponibles aún</div>
                    <div style={{ fontSize: 12 }}>Los datos se actualizarán automáticamente cuando el torneo comience</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                    {standings.map((group, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                        <div style={{ background: 'rgba(255,255,255,.06)', padding: '7px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
                            {group[0]?.group || `Grupo ${String.fromCharCode(65 + i)}`}
                          </span>
                        </div>
                        <StandingsTable standings={group} compact showForm={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FIXTURE */}
            {tab === 'fixture' && (
              <div>
                {fixtures.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, color: 'var(--text2)', marginBottom: 8 }}>Fixture próximamente</div>
                    <div style={{ fontSize: 12 }}>Se actualizará automáticamente cuando el torneo comience</div>
                  </div>
                ) : (
                  Object.entries(byRound).map(([round, roundFixtures]) => (
                    <div key={round} style={{ marginBottom: 24 }}>
                      <div style={{ padding: '6px 0', marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>{round}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
                        {roundFixtures.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ELIMINATORIAS */}
            {tab === 'eliminatorias' && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, color: 'var(--text2)', marginBottom: 8 }}>Fase eliminatoria</div>
                <div style={{ fontSize: 13 }}>Disponible cuando comiencen los octavos de final</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Los datos se actualizarán automáticamente desde la API</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
