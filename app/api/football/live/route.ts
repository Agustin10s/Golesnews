import { NextResponse } from 'next/server';
import { ALL_LEAGUE_IDS } from '@/lib/football-api';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

const FOLLOWED_LEAGUES = ALL_LEAGUE_IDS;

export const runtime = 'nodejs';
export const revalidate = 0; // always fresh for live

async function fetchLive(leagueId: number) {
  const res = await fetch(`${API_BASE}/fixtures?live=${leagueId}`, {
    headers: { 'x-apisports-key': API_KEY },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.response || [];
}

export async function GET() {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({ fixtures: [], demo: true, message: 'Configurá FOOTBALL_API_KEY en .env.local' });
    }

    const results = await Promise.allSettled(FOLLOWED_LEAGUES.map(fetchLive));
    const fixtures = results
      .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Deduplicate by fixture id
    const seen = new Set<number>();
    const unique = fixtures.filter((f: unknown) => {
      const fx = f as { fixture: { id: number } };
      if (seen.has(fx.fixture.id)) return false;
      seen.add(fx.fixture.id);
      return true;
    });

    return NextResponse.json({ fixtures: unique });
  } catch (e) {
    console.error('Live fixtures error:', e);
    return NextResponse.json({ fixtures: [], error: String(e) }, { status: 500 });
  }
}
