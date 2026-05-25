import { NextRequest, NextResponse } from 'next/server';
import { LEAGUES, CURRENT_SEASON, WC_SEASON } from '@/lib/football-api';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

const LEAGUE_SEASONS: Record<number, number> = {
  [LEAGUES.WORLD_CUP]: WC_SEASON,
};

async function fetchStandings(leagueId: number) {
  const season = LEAGUE_SEASONS[leagueId] || CURRENT_SEASON;
  const res = await fetch(`${API_BASE}/standings?league=${leagueId}&season=${season}`, {
    headers: { 'x-apisports-key': API_KEY },
    next: { revalidate: 1800 }, // 30 min cache for standings
  });
  if (!res.ok) return null;
  const data = await res.json();
  const resp = data.response?.[0];
  if (!resp) return null;
  return {
    league: resp.league,
    standings: resp.league.standings,
  };
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

    // All main leagues
    const mainLeagues = [
      LEAGUES.LIGA_PROFESIONAL,
      LEAGUES.PREMIER_LEAGUE,
      LEAGUES.LALIGA,
      LEAGUES.CHAMPIONS_LEAGUE,
      LEAGUES.LIBERTADORES,
      LEAGUES.SUDAMERICANA,
      LEAGUES.SERIE_A,
      LEAGUES.BUNDESLIGA,
    ];

    const results = await Promise.allSettled(mainLeagues.map(fetchStandings));
    const data: Record<number, unknown> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        data[mainLeagues[i]] = r.value;
      }
    });

    return NextResponse.json({ data });
  } catch (e) {
    console.error('Standings error:', e);
    return NextResponse.json({ data: {}, error: String(e) }, { status: 500 });
  }
}
