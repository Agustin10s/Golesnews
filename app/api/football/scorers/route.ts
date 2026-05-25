import { NextRequest, NextResponse } from 'next/server';
import { LEAGUES, LEAGUE_SEASONS } from '@/lib/football-api';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

export async function GET(req: NextRequest) {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({ scorers: [], demo: true });
    }

    const { searchParams } = req.nextUrl;
    const leagueId = parseInt(searchParams.get('league') || String(LEAGUES.LIGA_PROFESIONAL));
    // Usa la season correcta de la liga, o la que venga en el param
    const season = parseInt(searchParams.get('season') || String(LEAGUE_SEASONS[leagueId] ?? 2025));

    const res = await fetch(`${API_BASE}/players/topscorers?league=${leagueId}&season=${season}`, {
      headers: { 'x-apisports-key': API_KEY },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json({ scorers: [] });
    const data = await res.json();
    return NextResponse.json({ scorers: data.response || [] });
  } catch (e) {
    return NextResponse.json({ scorers: [], error: String(e) }, { status: 500 });
  }
}
