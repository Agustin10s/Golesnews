const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || '';

// ── LIGAS HABILITADAS (SOLO ESTAS) ───────────────────────────
export const LEAGUES = {
  // Argentina
  LIGA_PROFESIONAL: 128,   // Primera División Argentina
  PRIMERA_NACIONAL: 131,   // Liga B Nacional Argentina
  COPA_ARGENTINA: 130,     // Copa Argentina
  // Sudamérica
  LIBERTADORES: 13,        // Copa Libertadores
  SUDAMERICANA: 11,        // Copa Sudamericana
  // Europa
  PREMIER_LEAGUE: 39,      // Premier League (Inglaterra)
  LALIGA: 140,             // La Liga (España)
  SERIE_A: 135,            // Serie A (Italia)
  CHAMPIONS_LEAGUE: 2,     // UEFA Champions League
  EUROPA_LEAGUE: 3,        // UEFA Europa League
  // Américas
  MLS: 253,                // MLS (USA)
  // Mundial
  WORLD_CUP: 1,            // Copa Mundial FIFA 2026
} as const;

// Temporadas por liga
// Ligas europeas (Premier, LaLiga, Serie A, UCL, UEL): la API Football usa el año
// de INICIO de temporada. La 2025/26 se pide con season=2025.
// Argentina / Sudamérica / MLS / Mundial: año calendario, todos en 2026.
export const LEAGUE_SEASONS: Record<number, number> = {
  [128]: 2026,   // LPF Argentina 2026
  [131]: 2026,   // Primera Nacional 2026
  [130]: 2026,   // Copa Argentina 2026
  [13]:  2026,   // Libertadores 2026
  [11]:  2026,   // Sudamericana 2026
  [39]:  2025,   // Premier League 2025/26
  [140]: 2025,   // La Liga 2025/26
  [135]: 2025,   // Serie A 2025/26
  [2]:   2025,   // Champions League 2025/26
  [3]:   2025,   // Europa League 2025/26
  [253]: 2026,   // MLS 2026
  [1]:   2026,   // Mundial 2026
};

// Lista completa de todas las ligas habilitadas
export const ALL_LEAGUE_IDS = Object.values(LEAGUES) as number[];

export const WC_SEASON = 2026;

export interface Team {
  id: number;
  name: string;
  logo: string;
  code?: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag?: string;
  season: number;
  round?: string;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
}

export interface Score {
  halftime: { home: number | null; away: number | null };
  fulltime: { home: number | null; away: number | null };
  extratime: { home: number | null; away: number | null };
  penalty: { home: number | null; away: number | null };
}

export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  venue: { id: number | null; name: string | null; city: string | null };
  status: FixtureStatus;
}

export interface FixtureResponse {
  fixture: Fixture;
  league: League;
  teams: { home: Team; away: Team };
  goals: { home: number | null; away: number | null };
  score: Score;
  events?: MatchEvent[];
}

export interface MatchEvent {
  time: { elapsed: number; extra: number | null };
  team: Team;
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group?: string;
  form: string;
  status: string;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  update: string;
}

export interface TopScorer {
  player: { id: number; name: string; photo: string; nationality: string };
  statistics: Array<{
    team: Team;
    league: League;
    goals: { total: number | null; assists: number | null };
    games: { appearences: number };
  }>;
}

async function apiGet(endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(endpoint, API_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    next: { revalidate: 60 }, // 1 min cache by default
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

export async function getLiveFixtures(leagueIds?: number[]): Promise<FixtureResponse[]> {
  if (leagueIds && leagueIds.length > 0) {
    const results = await Promise.allSettled(
      leagueIds.map((id) => apiGet('/fixtures', { live: id }))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<FixtureResponse[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);
  }
  return apiGet('/fixtures', { live: 'all' });
}

export async function getTodayFixtures(leagueId?: number, season?: number): Promise<FixtureResponse[]> {
  const today = new Date().toISOString().split('T')[0];
  const params: Record<string, string | number> = { date: today };
  if (leagueId) params.league = leagueId;
  if (season) params.season = season;
  return apiGet('/fixtures', params);
}

export async function getFixturesByLeague(leagueId: number, season: number, next?: number, last?: number): Promise<FixtureResponse[]> {
  const params: Record<string, string | number> = { league: leagueId, season };
  if (next) params.next = next;
  if (last) params.last = last;
  return apiGet('/fixtures', params);
}

export async function getFixturesByDate(date: string, leagueId?: number): Promise<FixtureResponse[]> {
  const params: Record<string, string | number> = { date };
  if (leagueId) params.league = leagueId;
  return apiGet('/fixtures', params);
}

export async function getStandings(leagueId: number, season: number): Promise<Standing[][]> {
  const res = await apiGet('/standings', { league: leagueId, season });
  if (!res || res.length === 0) return [];
  return res[0]?.league?.standings || [];
}

export async function getTopScorers(leagueId: number, season: number): Promise<TopScorer[]> {
  return apiGet('/players/topscorers', { league: leagueId, season });
}

export async function getFixtureEvents(fixtureId: number): Promise<MatchEvent[]> {
  return apiGet('/fixtures/events', { fixture: fixtureId });
}
