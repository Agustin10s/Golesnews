import { NextRequest, NextResponse } from 'next/server';
import { ALL_LEAGUE_IDS, LEAGUE_SEASONS } from '@/lib/football-api';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

async function fetchStandings(leagueId: number) {
  const season = LEAGUE_SEASONS[leagueId] ?? 2025;
  const res = await fetch(`${API_BASE}/standings?league=${leagueId}&season=${season}`, {
    headers: { 'x-apisports-key': API_KEY },
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const resp = data.response?.[0];
  if (!resp) return null;
  return { league: resp.league, standings: resp.league.standings };
}

export async function GET(req: NextRequest) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({ data: {}, demo: true });
    }

    const { searchParams } = req.nextUrl;
    const leagueParam = searchParams.get('league');

    if (leagueParam) {
      const leagueId = parseInt(leagueParam);
      const data = await fetchStandings(leagueId);
      return NextResponse.json({ data });
    }

    // Todas las ligas habilitadas
    const results = await Promise.allSettled(ALL_LEAGUE_IDS.map(fetchStandings));
    const data: Record<number, unknown> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) data[ALL_LEAGUE_IDS[i]] = r.value;
    });

    return NextResponse.json({ data });
  } catch (e) {
    console.error('Standings error:', e);
    return NextResponse.json({ data: {}, error: String(e) }, { status: 500 });
  }
}
