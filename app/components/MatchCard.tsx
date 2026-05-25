import Image from 'next/image';
import Link from 'next/link';
import { formatMatchTime, formatMatchDate, getStatusLabel, isLive, isFinished } from '@/lib/utils';

interface MatchCardProps {
  fixture: {
    fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
    league: { id: number; name: string; logo: string; round?: string };
    teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
    goals: { home: number | null; away: number | null };
  };
  compact?: boolean;
}

export default function MatchCard({ fixture: f, compact }: MatchCardProps) {
  const live = isLive(f.fixture.status);
  const finished = isFinished(f.fixture.status);
  const statusLabel = getStatusLabel(f.fixture.status);

  return (
    <Link
      href={`/en-vivo#${f.fixture.id}`}
      style={{
        display: 'block',
        background: 'var(--bg2)',
        border: `1px solid ${live ? 'rgba(232,53,58,.25)' : 'var(--border)'}`,
        padding: compact ? '8px 12px' : '10px 13px',
        cursor: 'pointer',
        marginBottom: 6,
        transition: 'background .15s',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        {f.league.logo && (
          <Image src={f.league.logo} alt={f.league.name} width={14} height={14} style={{ objectFit: 'contain' }} />
        )}
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>
          {f.league.name}
          {f.league.round ? ` — ${f.league.round}` : ''}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          {f.teams.home.logo && (
            <Image src={f.teams.home.logo} alt={f.teams.home.name} width={20} height={20} style={{ objectFit: 'contain' }} />
          )}
          <span style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: finished && f.goals.home! > (f.goals.away ?? 0) ? 600 : 400 }}>
            {f.teams.home.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {finished || live ? (
            <>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 21, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>
                {f.goals.home ?? 0}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)', padding: '0 3px' }}>-</span>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 21, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>
                {f.goals.away ?? 0}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text2)', padding: '0 4px', whiteSpace: 'nowrap' }}>
              {formatMatchTime(f.fixture.date)}
            </span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: compact ? 12.5 : 13.5, fontWeight: finished && (f.goals.away ?? 0) > (f.goals.home ?? 0) ? 600 : 400, textAlign: 'right' }}>
            {f.teams.away.name}
          </span>
          {f.teams.away.logo && (
            <Image src={f.teams.away.logo} alt={f.teams.away.name} width={20} height={20} style={{ objectFit: 'contain' }} />
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '.3px', marginTop: 5 }}>
        {live ? (
          <span style={{ color: 'var(--red)' }}>{statusLabel}</span>
        ) : finished ? (
          <span style={{ color: 'var(--text3)' }}>Final</span>
        ) : (
          <span style={{ color: 'var(--text2)' }}>{formatMatchDate(f.fixture.date)}</span>
        )}
      </div>
    </Link>
  );
}
