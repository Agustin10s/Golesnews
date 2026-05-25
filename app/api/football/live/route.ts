import { NextResponse } from 'next/server';
import { ALL_LEAGUE_IDS } from '@/lib/football-api';
import { cachedFetch } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY  = process.env.FOOTBALL_API_KEY || '';

const TTL_LIVE = 60 * 1000; // 1 minuto

export async function GET() {
  try {
    if (!API_KEY || API_KEY === 'YOUR_API_FOOTBALL_KEY_HERE') {
      return NextResponse.json({
        fixtures: [],
        demo: true,
        message: 'Configurá FOOTBALL_API_KEY en .env.local',
      });
    }

    // Una sola llamada con todos los IDs separados por guión
    // La API soporta: ?live=2-3-13-11-...
    const liveParam = ALL_LEAGUE_IDS.join('-');

    const fixtures = await cachedFetch(
      `live:${liveParam}`,
      async () => {
        const res = await fetch(`${API_BASE}/fixtures?live=${liveParam}`, {
          headers: { 'x-apisports-key': API_KEY },
          cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.response || [];
      },
      TTL_LIVE,
    );

    // Deduplicar por ID de fixture (por si la API repite)
    const seen = new Set<number>();
    const unique = (fixtures as { fixture: { id: number } }[]).filter(f => {
      if (seen.has(f.fixture.id)) return false;
      seen.add(f.fixture.id);
      return true;
    });

    return NextResponse.json({ fixtures: unique });
  } catch (e) {
    console.error('Live fixtures error:', e);
    return NextResponse.json({ fixtures: [], error: String(e) }, { status: 500 });
  }
}
