import { NextRequest, NextResponse } from 'next/server';
import { LEAGUES, LEAGUE_SEASONS } from '@/lib/football-api';
import { cachedFetch } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY  = process.env.FOOTBALL_API_KEY || '';

const TTL = 6 * 60 * 60 * 1000; // 6 horas

export async function GET(req: NextRequest) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({ scorers: [], demo: true });
    }

    const { searchParams } = req.nextUrl;
    const leagueId = parseInt(
      searchParams.get('league') || String(LEAGUES.LIGA_PROFESIONAL),
    );
    const season = parseInt(
      searchParams.get('season') || String(LEAGUE_SEASONS[leagueId] ?? 2026),
    );

    const scorers = await cachedFetch(
      `scorers:${leagueId}:${season}`,
      async () => {
        const res = await fetch(
          `${API_BASE}/players/topscorers?league=${leagueId}&season=${season}`,
          { headers: { 'x-apisports-key': API_KEY }, cache: 'no-store' },
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.response || [];
      },
      TTL,
    );

    return NextResponse.json({ scorers });
  } catch (e) {
    return NextResponse.json({ scorers: [], error: String(e) }, { status: 500 });
  }
}
