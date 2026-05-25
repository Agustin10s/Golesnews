import { NextRequest, NextResponse } from 'next/server';
import { ALL_LEAGUE_IDS, LEAGUE_SEASONS } from '@/lib/football-api';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

async function fetchFixtures(params: Record<string, string>) {
  const url = new URL('/fixtures', API_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
    next: { revalidate: 300 },
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
    const league  = searchParams.get('league');
    const date    = searchParams.get('date');
    const next    = searchParams.get('next');
    const last    = searchParams.get('last');
    const section = searchParams.get('section');

    // ── HOY (todas las ligas habilitadas) ──────────────────────
    if (section === 'all-today') {
      const today = new Date().toISOString().split('T')[0];
      const fixtures = await fetchFixtures({ date: today });
      // Filtrar solo ligas habilitadas
      const allowed = new Set(ALL_LEAGUE_IDS);
      return NextResponse.json({
        fixtures: (fixtures as { league: { id: number } }[]).filter(f => allowed.has(f.league.id))
      });
    }

    // ── PRÓXIMOS / ÚLTIMOS de todas las ligas ──────────────────
    if (section === 'all-upcoming') {
      const results = await Promise.allSettled(
        ALL_LEAGUE_IDS.map(id =>
          fetchFixtures({ league: String(id), season: String(LEAGUE_SEASONS[id]), next: '8' })
        )
      );
      const fixtures = results
        .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      return NextResponse.json({ fixtures });
    }

    if (section === 'all-recent') {
      // Últimos resultados de todas las ligas habilitadas
      const results = await Promise.allSettled(
        ALL_LEAGUE_IDS.map(id =>
          fetchFixtures({ league: String(id), season: String(LEAGUE_SEASONS[id]), last: '5' })
        )
      );
      const fixtures = results
        .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      return NextResponse.json({ fixtures });
    }

    // ── LIGA ESPECÍFICA ────────────────────────────────────────
    if (league) {
      const leagueId = parseInt(league);
      const season = LEAGUE_SEASONS[leagueId] ?? 2025;
      const params: Record<string, string> = {
        league: String(leagueId),
        season: String(season),
      };
      if (date) params.date = date;
      if (next) params.next = next;
      if (last) params.last = last;
      // Si no especifican ni next ni last, traer últimos 20 + próximos 10
      if (!date && !next && !last) {
        const [recientes, proximos] = await Promise.all([
          fetchFixtures({ ...params, last: '20' }),
          fetchFixtures({ ...params, next: '10' }),
        ]);
        const seen = new Set<number>();
        const merged = [...recientes, ...proximos].filter((f: unknown) => {
          const fx = f as { fixture: { id: number } };
          if (seen.has(fx.fixture.id)) return false;
          seen.add(fx.fixture.id);
          return true;
        });
        return NextResponse.json({ fixtures: merged });
      }
      const fixtures = await fetchFixtures(params);
      return NextResponse.json({ fixtures });
    }

    // ── FECHA ESPECÍFICA ───────────────────────────────────────
    if (date) {
      const allowed = new Set(ALL_LEAGUE_IDS);
      const fixtures = await fetchFixtures({ date });
      return NextResponse.json({
        fixtures: (fixtures as { league: { id: number } }[]).filter(f => allowed.has(f.league.id))
      });
    }

    // Default: hoy filtrado
    const today = new Date().toISOString().split('T')[0];
    const allowed = new Set(ALL_LEAGUE_IDS);
    const fixtures = await fetchFixtures({ date: today });
    return NextResponse.json({
      fixtures: (fixtures as { league: { id: number } }[]).filter(f => allowed.has(f.league.id))
    });

  } catch (e) {
    console.error('Fixtures error:', e);
    return NextResponse.json({ fixtures: [], error: String(e) }, { status: 500 });
  }
}
