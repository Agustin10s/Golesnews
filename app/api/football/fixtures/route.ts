import { NextRequest, NextResponse } from 'next/server';
import { ALL_LEAGUE_IDS, LEAGUE_SEASONS } from '@/lib/football-api';
import { cachedFetch } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY  = process.env.FOOTBALL_API_KEY || '';

// TTLs en milisegundos
const TTL_TODAY    = 10 * 60 * 1000;   // 10 min  — partidos de hoy
const TTL_UPCOMING = 60 * 60 * 1000;   // 1 hora  — próximos partidos
const TTL_RECENT   = 6  * 60 * 60 * 1000; // 6 h  — resultados históricos
const TTL_LIVE     = 60 * 1000;         // 1 min  — en vivo

async function apiFetch(params: Record<string, string>): Promise<unknown[]> {
  const url = new URL('/fixtures', API_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.response || [];
}

/** Fixtures de una liga con caché */
async function leagueFixtures(
  leagueId: number,
  mode: 'next' | 'last' | 'both',
  ttl: number,
): Promise<unknown[]> {
  const season = String(LEAGUE_SEASONS[leagueId] ?? 2026);
  const league = String(leagueId);
  const cacheKey = `fixtures:${leagueId}:${season}:${mode}`;

  return cachedFetch(cacheKey, async () => {
    if (mode === 'both') {
      const [recent, upcoming] = await Promise.all([
        apiFetch({ league, season, last: '20' }),
        apiFetch({ league, season, next: '10' }),
      ]);
      const seen = new Set<number>();
      return [...recent, ...upcoming].filter((f) => {
        const id = (f as { fixture: { id: number } }).fixture.id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }
    if (mode === 'next') return apiFetch({ league, season, next: '8' });
    return apiFetch({ league, season, last: '5' });
  }, ttl);
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

    // ── HOY ──────────────────────────────────────────────────────
    if (section === 'all-today') {
      const today = new Date().toISOString().split('T')[0];
      const allowed = new Set(ALL_LEAGUE_IDS);
      const fixtures = await cachedFetch(
        `fixtures:today:${today}`,
        () => apiFetch({ date: today }),
        TTL_TODAY,
      );
      return NextResponse.json({
        fixtures: (fixtures as { league: { id: number } }[]).filter(
          f => allowed.has(f.league.id),
        ),
      });
    }

    // ── PRÓXIMOS (todas las ligas) ────────────────────────────────
    if (section === 'all-upcoming') {
      const results = await Promise.allSettled(
        ALL_LEAGUE_IDS.map(id => leagueFixtures(id, 'next', TTL_UPCOMING)),
      );
      const fixtures = results
        .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      return NextResponse.json({ fixtures });
    }

    // ── RECIENTES (todas las ligas) ───────────────────────────────
    if (section === 'all-recent') {
      const results = await Promise.allSettled(
        ALL_LEAGUE_IDS.map(id => leagueFixtures(id, 'last', TTL_RECENT)),
      );
      const fixtures = results
        .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      return NextResponse.json({ fixtures });
    }

    // ── EN VIVO ───────────────────────────────────────────────────
    if (section === 'live') {
      const liveIds = ALL_LEAGUE_IDS.join('-');
      const fixtures = await cachedFetch(
        `fixtures:live:${liveIds}`,
        () => apiFetch({ live: liveIds }),
        TTL_LIVE,
      );
      return NextResponse.json({ fixtures });
    }

    // ── LIGA ESPECÍFICA ───────────────────────────────────────────
    if (league) {
      const leagueId = parseInt(league);
      const season = String(LEAGUE_SEASONS[leagueId] ?? 2026);
      const leagueStr = String(leagueId);

      if (date) {
        const fixtures = await cachedFetch(
          `fixtures:${leagueId}:date:${date}`,
          () => apiFetch({ league: leagueStr, season, date }),
          TTL_TODAY,
        );
        return NextResponse.json({ fixtures });
      }
      if (next) {
        const fixtures = await cachedFetch(
          `fixtures:${leagueId}:${season}:next:${next}`,
          () => apiFetch({ league: leagueStr, season, next }),
          TTL_UPCOMING,
        );
        return NextResponse.json({ fixtures });
      }
      if (last) {
        const fixtures = await cachedFetch(
          `fixtures:${leagueId}:${season}:last:${last}`,
          () => apiFetch({ league: leagueStr, season, last }),
          TTL_RECENT,
        );
        return NextResponse.json({ fixtures });
      }
      // Sin parámetros → últimos 20 + próximos 10
      const fixtures = await leagueFixtures(leagueId, 'both', TTL_UPCOMING);
      return NextResponse.json({ fixtures });
    }

    // ── FECHA ESPECÍFICA ──────────────────────────────────────────
    if (date) {
      const allowed = new Set(ALL_LEAGUE_IDS);
      const fixtures = await cachedFetch(
        `fixtures:date:${date}`,
        () => apiFetch({ date }),
        TTL_TODAY,
      );
      return NextResponse.json({
        fixtures: (fixtures as { league: { id: number } }[]).filter(
          f => allowed.has(f.league.id),
        ),
      });
    }

    // Default: hoy
    const today = new Date().toISOString().split('T')[0];
    const allowed = new Set(ALL_LEAGUE_IDS);
    const fixtures = await cachedFetch(
      `fixtures:today:${today}`,
      () => apiFetch({ date: today }),
      TTL_TODAY,
    );
    return NextResponse.json({
      fixtures: (fixtures as { league: { id: number } }[]).filter(
        f => allowed.has(f.league.id),
      ),
    });

  } catch (e) {
    console.error('Fixtures error:', e);
    return NextResponse.json({ fixtures: [], error: String(e) }, { status: 500 });
  }
}
