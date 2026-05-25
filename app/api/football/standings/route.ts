import { NextRequest, NextResponse } from 'next/server';
import { ALL_LEAGUE_IDS, LEAGUE_SEASONS } from '@/lib/football-api';
import { cachedFetch } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY  = process.env.FOOTBALL_API_KEY || '';

const TTL = 6 * 60 * 60 * 1000; // 6 horas — las tablas no cambian frecuentemente

async function fetchStandings(leagueId: number) {
  const season = LEAGUE_SEASONS[leagueId] ?? 2026;
  return cachedFetch(
    `standings:${leagueId}:${season}`,
    async () => {
      const res = await fetch(
        `${API_BASE}/standings?league=${leagueId}&season=${season}`,
        { headers: { 'x-apisports-key': API_KEY }, cache: 'no-store' },
      );
      if (!res.ok) return null;
      const data = await res.json();
      const resp = data.response?.[0];
      if (!resp) return null;
      return { league: resp.league, standings: resp.league.standings };
    },
    TTL,
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({ data: null, demo: true });
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
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 });
  }
}
