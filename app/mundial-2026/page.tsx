'use client';
import { useEffect, useState } from 'react';
import StandingsTable from '../components/StandingsTable';
import MatchCard from '../components/MatchCard';
import { LEAGUES } from '@/lib/football-api';
import { MUNDIAL_GROUPS, SR, StaticFixture } from '@/lib/static-standings';

type Fixture     = StaticFixture;
type StandingRow = SR;

// ── Bracket component ────────────────────────────────────────
const BracketSlot = ({ label, sub }: { label: string; sub?: string }) => (
  <div style={{
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 4, padding: '7px 10px', minWidth: 140, textAlign: 'center',
  }}>
    <div style={{ fontSize: 11.5, fontWeight: 500, color: '#e8e8e8', whiteSpace: 'nowrap' }}>{label}</div>
    {sub && <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const BracketMatch = ({ a, b, aLabel, bLabel }: { a: string; b: string; aLabel?: string; bLabel?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
    <BracketSlot label={a} sub={aLabel} />
    <div style={{ textAlign: 'center', fontSize: 8, color: 'var(--text3)', lineHeight: 1 }}>VS</div>
    <BracketSlot label={b} sub={bLabel} />
  </div>
);

function KnockoutBracket() {
  return (
    <div>
      {/* Round of 32 note */}
      <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          📅 Ronda de 32 · 28 jun – 4 jul
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7 }}>
          Clasifican 32 equipos: los <strong>8 ganadores</strong> de grupo avanzan directo a Octavos. Los <strong>8 segundos</strong> y <strong>8 mejores terceros</strong> juegan la Ronda de 32.
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 6 }}>
          {['1º A vs 2º B', '1º C vs 2º D', '1º E vs 2º F', '1º G vs 2º H',
            '1º I vs 2º J', '1º K vs 2º L', '1º B vs 2º A', '1º D vs 2º C',
            '1º F vs 2º E', '1º H vs 2º G', '1º J vs 2º I', '1º L vs 2º K',
            'Mejor 3º (×4 partidos)', 'Mejor 3º (×4 partidos)',].map((m, i) => (
            <div key={i} style={{ fontSize: 10, padding: '5px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 3, color: 'var(--text2)' }}>
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Octavos / QF / SF / Final */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 24, minWidth: 700, alignItems: 'flex-start' }}>

          {/* Octavos */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Octavos · 5–8 jul</div>
            {['RD1 vs RD2','RD3 vs RD4','RD5 vs RD6','RD7 vs RD8',
              'RD9 vs RD10','RD11 vs RD12','RD13 vs RD14','RD15 vs RD16'].map((m, i) => (
              <BracketMatch key={i} a={`Ganador RD${i * 2 + 1}`} b={`Ganador RD${i * 2 + 2}`} />
            ))}
          </div>

          {/* Cuartos */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Cuartos · 11–12 jul</div>
            {['1/8-A vs 1/8-B','1/8-C vs 1/8-D','1/8-E vs 1/8-F','1/8-G vs 1/8-H'].map((m, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <BracketMatch a={`Gan. Octavo ${i * 2 + 1}`} b={`Gan. Octavo ${i * 2 + 2}`} />
              </div>
            ))}
          </div>

          {/* Semifinales */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Semis · 15–16 jul</div>
            <div style={{ marginBottom: 60 }}>
              <BracketMatch a="Gan. Cuarto 1" b="Gan. Cuarto 2" aLabel="MetLife Stadium" />
            </div>
            <div>
              <BracketMatch a="Gan. Cuarto 3" b="Gan. Cuarto 4" aLabel="AT&T Stadium, Dallas" />
            </div>
          </div>

          {/* Final */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>🏆 FINAL · 19 jul</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{
                background: 'linear-gradient(135deg,rgba(212,175,55,.15),rgba(212,175,55,.05))',
                border: '1px solid rgba(212,175,55,.4)', borderRadius: 6, padding: '12px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, marginBottom: 8 }}>MetLife Stadium, NJ</div>
                <BracketSlot label="Gan. SF 1" sub="🏆 Campeón" />
                <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', padding: '4px 0' }}>VS</div>
                <BracketSlot label="Gan. SF 2" />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>
              3º y 4º puesto<br />18 jul · Rose Bowl, LA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MundialPage() {
  const [fixtures,  setFixtures]  = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<StandingRow[][]>(MUNDIAL_GROUPS);
  const [tab, setTab] = useState<'grupos' | 'fixture' | 'eliminatorias'>('grupos');
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/football/fixtures?league=${LEAGUES.WORLD_CUP}&next=30`).then(r => r.json()),
      fetch(`/api/football/standings?league=${LEAGUES.WORLD_CUP}`).then(r => r.json()),
    ]).then(([fxData, stData]) => {
      if (fxData.fixtures?.length) setFixtures(fxData.fixtures);
      if (stData.data?.standings?.length) {
        setStandings(stData.data.standings);
        setFromApi(true);
      }
    }).catch(() => {});
  }, []);

  const byRound = fixtures.reduce((acc, f) => {
    const r = f.league.round ?? 'Otra';
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
                🇲🇽 MÉXICO · 🇨🇦 CANADÁ · 🇺🇸 ESTADOS UNIDOS
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['48', 'Equipos'], ['12', 'Grupos'], ['104', 'Partidos'], ['11 jun', 'Inicio'], ['19 jul', 'Final']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inicio countdown */}
        <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.25)', borderRadius: 6, fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⏰ <strong>El torneo comienza el 11 de junio de 2026.</strong>
          <span style={{ color: 'var(--text2)', fontWeight: 400 }}>
            Partido inaugural: 🇲🇽 México vs 🇿🇦 Sudáfrica — Estadio Azteca, Ciudad de México
          </span>
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
              {t === 'grupos' ? 'Grupos & Sorteo' : t === 'fixture' ? 'Fixture' : 'Fase Final'}
            </button>
          ))}
        </div>

        {/* GRUPOS */}
        {tab === 'grupos' && (
          <div>
            {!fromApi && (
              <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 14 }}>
                📊 Sorteo realizado el 5 de diciembre de 2025 en Washington D.C. — El torneo comienza el 11 de junio.
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
              {standings.map((group, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 4 }}>
                  <div style={{ background: 'rgba(255,255,255,.06)', padding: '7px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
                      {group[0]?.group ?? `Grupo ${String.fromCharCode(65 + i)}`}
                    </span>
                    {/* Host marker */}
                    {i < 3 && (
                      <span style={{ fontSize: 9, color: 'var(--text3)', background: 'rgba(255,255,255,.05)', padding: '1px 6px', borderRadius: 2 }}>
                        {i === 0 ? '🇲🇽 Sede' : i === 1 ? '🇨🇦 Sede' : '🇺🇸 Sede'}
                      </span>
                    )}
                  </div>
                  {fromApi ? (
                    <StandingsTable standings={group} compact showForm={false} />
                  ) : (
                    <div style={{ padding: '8px 0' }}>
                      {group.map((team, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderBottom: j < group.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)', width: 14, textAlign: 'center', fontWeight: 600 }}>{j + 1}</span>
                          <span style={{ fontSize: 13, flex: 1 }}>{team.team.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIXTURE */}
        {tab === 'fixture' && (
          <div>
            {fixtures.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, color: 'var(--text2)', marginBottom: 8 }}>
                  Fixture disponible a partir del 11 de junio
                </div>
                <div style={{ fontSize: 12 }}>Se actualizará automáticamente cuando el torneo comience</div>
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, display: 'inline-block', textAlign: 'left' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Calendario Fase de Grupos</div>
                  {[['Jornada 1', '11–15 de junio'], ['Jornada 2', '16–20 de junio'], ['Jornada 3 (simultánea)', '21–25 de junio'], ['Cierre Fase de Grupos', '27 de junio']].map(([fase, fecha]) => (
                    <div key={fase} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 11 }}>
                      <span style={{ color: 'var(--text2)' }}>{fase}</span>
                      <span style={{ color: 'var(--text3)' }}>{fecha}</span>
                    </div>
                  ))}
                </div>
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

        {/* FASE FINAL */}
        {tab === 'eliminatorias' && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 11, color: 'var(--text2)' }}>
              <strong style={{ color: 'var(--gold)' }}>Formato:</strong> 32 equipos avanzan de grupos → Ronda de 32 (R32) → Octavos → Cuartos → Semifinales → Final
            </div>
            <KnockoutBracket />
          </div>
        )}

      </div>
    </div>
  );
}
