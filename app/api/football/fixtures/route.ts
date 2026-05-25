import { NextRequest, NextResponse } from 'next/server';
import { LEAGUES, CURRENT_SEASON, WC_SEASON } from '@/lib/football-api';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

const LEAGUE_SEASONS: Record<number, number> = {
  [LEAGUES.WORLD_CUP]: WC_SEASON,
};

async function fetchFixtures(params: Record<string, string>) {
  const url = new URL('/fixtures', API_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
    next: { revalidate: 300 }, // 5 min cache
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.response || [];
}

export async function GET(req: NextRequest) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({ fixtures: [], demo: true });
    }

    const { searchParams } = req.nextUrl;
    const league = searchParams.get('league');
    const date = searchParams.get('date');
    const next = searchParams.get('next');
    const last = searchParams.get('last');
    const section = searchParams.get('section'); // 'today', 'next7', 'last7', 'all-today'

    const params: Record<string, string> = {};

    if (section === 'all-today') {
      // Get today's matches across all followed leagues
      const today = new Date().toISOString().split('T')[0];
      params.date = today;
      const fixtures = await fetchFixtures(params);
      return NextResponse.json({ fixtures });
    }

    if (section === 'all-upcoming') {
      // Next 7 days across main leagues
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      params.from = today;
      params.to = nextWeek;
      const leagueIds = [
        LEAGUES.LIGA_PROFESIONAL, LEAGUES.PREMIER_LEAGUE, LEAGUES.LALIGA,
        LEAGUES.CHAMPIONS_LEAGUE, LEAGUES.LIBERTADORES, LEAGUES.WORLD_CUP
      ];
      const results = await Promise.allSettled(
        leagueIds.map(id => fetchFixtures({
          ...params,
          league: String(id),
          season: String(LEAGUE_SEASONS[id] || CURRENT_SEASON)
        }))
      );
      const fixtures = results
        .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      return NextResponse.json({ fixtures });
    }

    if (league) {
      const leagueId = parseInt(league);
      const season = LEAGUE_SEASONS[leagueId] || CURRENT_SEASON;
      params.league = league;
      params.season = String(season);
      if (date) params.date = date;
      if (next) params.next = next;
      if (last) params.last = last;
    } else if (date) {
      params.date = date;
    } else {
      // Default: today
      params.date = new Date().toISOString().split('T')[0];
    }

    const fixtures = await fetchFixtures(params);
    return NextResponse.json({ fixtures });
  } catch (e) {
    console.error('Fixtures error:', e);
    return NextResponse.json({ fixtures: [], error: String(e) }, { status: 500 });
  }
}
