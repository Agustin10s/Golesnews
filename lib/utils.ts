export interface FixtureBase {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { id: number; name: string; logo: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

export function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatMatchTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' });
}

export function getStatusLabel(status: { short: string; elapsed: number | null }): string {
  switch (status.short) {
    case 'NS': return 'Programado';
    case '1H': return `${status.elapsed}'`;
    case 'HT': return 'Descanso';
    case '2H': return `${status.elapsed}'`;
    case 'ET': return `${status.elapsed}' (Prórroga)`;
    case 'P': return 'Penales';
    case 'FT': return 'Final';
    case 'AET': return 'Final (PE)';
    case 'PEN': return 'Final (Pen)';
    case 'SUSP': return 'Suspendido';
    case 'PST': return 'Postergado';
    case 'CANC': return 'Cancelado';
    default: return status.short;
  }
}

export function isLive(status: { short: string }): boolean {
  return ['1H', 'HT', '2H', 'ET', 'P', 'BT', 'INT'].includes(status.short);
}

export function isFinished(status: { short: string }): boolean {
  return ['FT', 'AET', 'PEN'].includes(status.short);
}

export function isScheduled(status: { short: string }): boolean {
  return ['NS', 'TBD'].includes(status.short);
}

export function groupFixturesByDate<T extends FixtureBase>(fixtures: T[]): Record<string, T[]> {
  return fixtures.reduce((acc, f) => {
    const date = f.fixture.date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(f);
    return acc;
  }, {} as Record<string, T[]>);
}

export function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'HOY';
  if (d.toDateString() === tomorrow.toDateString()) return 'MAÑANA';
  if (d.toDateString() === yesterday.toDateString()) return 'AYER';
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
}

export function getLeagueName(id: number): string {
  const names: Record<number, string> = {
    128: 'Liga Profesional',
    130: 'Copa Argentina',
    39: 'Premier League',
    140: 'La Liga',
    2: 'Champions League',
    13: 'Copa Libertadores',
    11: 'Copa Sudamericana',
    1: 'Mundial 2026',
    135: 'Serie A',
    78: 'Bundesliga',
  };
  return names[id] || 'Liga';
}
