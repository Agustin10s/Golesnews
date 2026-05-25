'use client';
import Image from 'next/image';

interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  description?: string | null;
}

interface StandingsTableProps {
  standings: StandingRow[];
  leagueName?: string;
  compact?: boolean;
  showForm?: boolean;
}

function FormDot({ char }: { char: string }) {
  const cls = char === 'W' ? 'form-w' : char === 'D' ? 'form-d' : 'form-l';
  return (
    <span className={cls} style={{ display: 'inline-block', width: 13, height: 13, borderRadius: '50%', fontSize: 7.5, fontWeight: 700, textAlign: 'center', lineHeight: '13px', margin: '0 1px' }}>
      {char === 'W' ? 'G' : char === 'D' ? 'E' : 'P'}
    </span>
  );
}

function isPromotion(desc: string | null | undefined) {
  if (!desc) return false;
  return desc.toLowerCase().includes('champion') || desc.toLowerCase().includes('promotion') || desc.toLowerCase().includes('champions');
}
function isEuropa(desc: string | null | undefined) {
  if (!desc) return false;
  return desc.toLowerCase().includes('europa') || desc.toLowerCase().includes('conference');
}
function isRelegation(desc: string | null | undefined) {
  if (!desc) return false;
  return desc.toLowerCase().includes('relega');
}

export default function StandingsTable({ standings, leagueName, compact, showForm = true }: StandingsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        Tabla no disponible
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {leagueName && (
        <div style={{ padding: '9px 13px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {leagueName}
          </span>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
        <thead>
          <tr>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)', width: 24 }}>#</th>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>Equipo</th>
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>PJ</th>
            {!compact && <>
              <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>PG</th>
              <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>PE</th>
              <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>PP</th>
              <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>GF</th>
              <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>GC</th>
            </>}
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>DG</th>
            <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid var(--border)' }}>PTS</th>
            {showForm && !compact && <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 9, fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>Forma</th>}
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const promotion = isPromotion(row.description);
            const europa = isEuropa(row.description);
            const relegation = isRelegation(row.description);
            const posColor = promotion ? 'var(--gold)' : europa ? '#1976d2' : relegation ? 'var(--red)' : 'var(--text3)';

            return (
              <tr key={row.rank} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 700, textAlign: 'center', color: posColor, width: 24, fontSize: 11 }}>
                  {row.rank}
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {row.team.logo && (
                      <Image src={row.team.logo} alt={row.team.name} width={18} height={18} style={{ objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 500, fontSize: 12 }}>{row.team.name}</span>
                  </div>
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text2)' }}>{row.all.played}</td>
                {!compact && <>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text2)' }}>{row.all.win}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text2)' }}>{row.all.draw}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text2)' }}>{row.all.lose}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text2)' }}>{row.all.goals.for}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text2)' }}>{row.all.goals.against}</td>
                </>}
                <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text3)', fontSize: 11 }}>
                  {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{row.points}</td>
                {showForm && !compact && (
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    {(row.form || '').split('').slice(-5).map((c, i) => (
                      <FormDot key={i} char={c} />
                    ))}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
