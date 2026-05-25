/**
 * lib/static-standings.ts
 * Datos estáticos actualizados al 25 de mayo de 2026.
 * Sirven como estado inicial en las páginas. Si la API responde con datos
 * reales, éstos se sobreescriben automáticamente.
 */

export interface SR {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  description?: string | null;
  group?: string;
}

export interface StaticScorer {
  player: { name: string; photo: string };
  statistics: [{ team: { name: string }; goals: { total: number } }];
}

export interface StaticFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string | null; city: string | null } };
  league: { id: number; name: string; logo: string; country: string; round?: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

// Helpers
const s = (
  rank: number, name: string, pts: number, pj: number,
  pg: number, pe: number, pp: number, gf: number, gc: number,
  desc?: string | null, group?: string,
): SR => ({
  rank,
  team: { id: rank, name, logo: '' },
  points: pts,
  goalsDiff: gf - gc,
  form: '',
  all: { played: pj, win: pg, draw: pe, lose: pp, goals: { for: gf, against: gc } },
  description: desc ?? null,
  group,
});

const sc = (name: string, team: string, goals: number): StaticScorer => ({
  player: { name, photo: '' },
  statistics: [{ team: { name: team }, goals: { total: goals } }],
});

// ═══════════════════════════════════════════════════════════════
// 🇦🇷  LIGA PROFESIONAL ARGENTINA — Torneo Apertura 2026
//       CAMPEÓN: Belgrano de Córdoba (24/05/2026)
// ═══════════════════════════════════════════════════════════════
export const LPF_ZONA_A: SR[] = [
  s(1,  'Estudiantes (LP)',       31, 16,  9, 4,  3, 19,  7, 'Champions League', 'Zona A'),
  s(2,  'Boca Juniors',           30, 16,  8, 6,  2, 22,  9, 'Champions League', 'Zona A'),
  s(3,  'Vélez Sarsfield',        28, 16,  7, 7,  2, 18, 12, 'Champions League', 'Zona A'),
  s(4,  'Talleres (C)',            26, 16,  7, 5,  4, 17, 13, 'Champions League', 'Zona A'),
  s(5,  'Independiente',          24, 16,  6, 6,  4, 24, 20, 'Champions League', 'Zona A'),
  s(6,  'Lanús',                  24, 16,  6, 6,  4, 18, 15, 'Champions League', 'Zona A'),
  s(7,  'San Lorenzo',            22, 16,  5, 7,  4, 14, 14, 'Champions League', 'Zona A'),
  s(8,  'Unión',                  21, 16,  5, 6,  5, 24, 20, 'Champions League', 'Zona A'),
  s(9,  'Instituto',              21, 16,  6, 3,  7, 16, 18, null, 'Zona A'),
  s(10, 'Defensa y Justicia',     19, 16,  4, 7,  5, 15, 17, null, 'Zona A'),
  s(11, 'Gimnasia y E. (M)',      19, 16,  5, 4,  7, 13, 17, null, 'Zona A'),
  s(12, 'Platense',               16, 16,  3, 7,  6, 13, 17, null, 'Zona A'),
  s(13, 'Central Córdoba (SdE)',  16, 16,  4, 4,  8, 11, 20, null, 'Zona A'),
  s(14, "Newell's Old Boys",      15, 16,  3, 6,  7, 13, 19, null, 'Zona A'),
  s(15, 'Deportivo Riestra',      11, 16,  1, 8,  7,  9, 18, 'Relegation', 'Zona A'),
];

export const LPF_ZONA_B: SR[] = [
  s(1,  'Ind. Rivadavia',         34, 16, 10, 4,  2, 29, 15, 'Champions League', 'Zona B'),
  s(2,  'River Plate',            29, 16,  9, 2,  5, 22, 12, 'Champions League', 'Zona B'),
  s(3,  'Argentinos Juniors',     29, 16,  8, 5,  3, 17, 13, 'Champions League', 'Zona B'),
  s(4,  'Rosario Central',        28, 16,  8, 4,  4, 20, 16, 'Champions League', 'Zona B'),
  s(5,  'Belgrano ⭐',            26, 16,  7, 5,  4, 17, 11, 'Champions League', 'Zona B'),
  s(6,  'Gimnasia y E. (LP)',     26, 16,  8, 2,  6, 19, 19, 'Champions League', 'Zona B'),
  s(7,  'Huracán',                22, 16,  5, 7,  4, 17, 13, 'Champions League', 'Zona B'),
  s(8,  'Racing Club',            21, 16,  5, 6,  5, 17, 15, 'Champions League', 'Zona B'),
  s(9,  'Barracas Central',       21, 16,  5, 6,  5, 14, 17, null, 'Zona B'),
  s(10, 'Tigre',                  20, 16,  4, 8,  4, 15, 14, null, 'Zona B'),
  s(11, 'Sarmiento (J)',          19, 16,  6, 1,  9, 14, 22, null, 'Zona B'),
  s(12, 'Banfield',               18, 16,  5, 3,  8, 14, 20, null, 'Zona B'),
  s(13, 'Atlético Tucumán',       14, 16,  3, 5,  8, 10, 18, null, 'Zona B'),
  s(14, 'Aldosivi',                8, 16,  0, 8,  8,  7, 20, 'Relegation', 'Zona B'),
  s(15, 'Estudiantes (RC)',        5, 16,  1, 2, 13,  8, 32, 'Relegation', 'Zona B'),
];

export const LPF_SCORERS: StaticScorer[] = [
  sc('Gabriel Ávalos',     'Independiente',  10),
  sc('Jordy Caicedo',      'Huracán',         8),
  sc('Cristian Tarragona', 'Unión',           8),
  sc('David Romero',       'Tigre',           7),
  sc('Fabrizio Sartori',   'Ind. Rivadavia',  7),
  sc('Marcelo Torres',     'Gimnasia (LP)',   7),
];

// Copa Argentina 2026 — 16avos de Final (próximos)
export const COPA_ARG_FIXTURES: StaticFixture[] = [
  { fixture: { id: 9001, date: '2026-05-30T17:00:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'Instituto', logo: '' }, away: { name: 'Lanús', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9002, date: '2026-05-30T19:30:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'Gimnasia (Jujuy)', logo: '' }, away: { name: 'Belgrano', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9003, date: '2026-05-31T17:00:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'Racing Club', logo: '' }, away: { name: 'Defensa y Justicia', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9004, date: '2026-06-06T17:00:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'San Lorenzo', logo: '' }, away: { name: 'Deportivo Riestra', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9005, date: '2026-06-08T17:00:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'Boca Juniors', logo: '' }, away: { name: 'Sarmiento (J)', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9006, date: '2026-06-08T19:30:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'River Plate', logo: '' }, away: { name: 'Aldosivi', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9007, date: '2026-06-09T17:00:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'Tigre', logo: '' }, away: { name: 'Ind. Rivadavia', logo: '' } },
    goals: { home: null, away: null } },
  { fixture: { id: 9008, date: '2026-06-09T19:30:00-03:00', status: { short: 'NS', elapsed: null }, venue: { name: null, city: null } },
    league: { id: 130, name: 'Copa Argentina', logo: '', country: 'Argentina', round: '16avos de Final' },
    teams: { home: { name: 'Rosario Central', logo: '' }, away: { name: 'Estudiantes (LP)', logo: '' } },
    goals: { home: null, away: null } },
];

// ═══════════════════════════════════════════════════════════════
// 🇦🇷  PRIMERA NACIONAL 2026  (Fecha 14)
// ═══════════════════════════════════════════════════════════════
export const PN_ZONA_A: SR[] = [
  s(1,  'Deportivo Morón',         25, 14, 7, 4, 3, 20, 12, 'Champions League', 'Zona A'),
  s(2,  'Ciudad de Bolívar',       25, 14, 6, 7, 1, 12,  7, 'Europa League',    'Zona A'),
  s(3,  'Los Andes',               24, 14, 6, 6, 2, 12,  4, null, 'Zona A'),
  s(4,  'Colón (Santa Fe)',        24, 14, 6, 6, 2, 17, 12, null, 'Zona A'),
  s(5,  'Ferro Carril Oeste',      24, 14, 7, 3, 4, 15, 11, null, 'Zona A'),
  s(6,  'Godoy Cruz',              22, 14, 5, 7, 2, 16, 10, null, 'Zona A'),
  s(7,  'Deportivo Madryn',        22, 14, 6, 4, 4, 20, 15, null, 'Zona A'),
  s(8,  'Almirante Brown',         19, 14, 5, 4, 5,  8,  9, null, 'Zona A'),
  s(9,  'San Miguel',              18, 14, 4, 6, 4, 11, 16, null, 'Zona A'),
  s(10, 'Mitre (Sgo. del Estero)', 17, 14, 3, 8, 3, 15, 12, null, 'Zona A'),
  s(11, 'Defensores de Belgrano',  16, 14, 3, 7, 4, 11, 12, null, 'Zona A'),
  s(12, 'Estudiantes (BA)',        16, 14, 4, 4, 6,  9, 13, null, 'Zona A'),
  s(13, 'San Telmo',               15, 14, 3, 6, 5, 12, 15, null, 'Zona A'),
  s(14, 'Racing (Córdoba)',        15, 14, 4, 3, 7, 13, 18, null, 'Zona A'),
  s(15, 'Acassuso',                14, 14, 4, 2, 8,  9, 14, null, 'Zona A'),
  s(16, 'All Boys',                14, 14, 3, 5, 6,  8, 15, null, 'Zona A'),
  s(17, 'Central Norte',           13, 14, 3, 4, 7,  8, 13, null, 'Zona A'),
  s(18, 'Chaco For Ever',           8, 14, 1, 5, 8, 10, 19, 'Relegation', 'Zona A'),
];

export const PN_ZONA_B: SR[] = [
  s(1,  'Gimnasia y E. (Jujuy)',   27, 14, 8, 3, 3, 21, 15, 'Champions League', 'Zona B'),
  s(2,  'Atlanta',                 26, 14, 8, 2, 4, 17,  9, 'Europa League',    'Zona B'),
  s(3,  'Tristán Suárez',          24, 14, 6, 6, 2, 14,  9, null, 'Zona B'),
  s(4,  'Midland',                 22, 14, 6, 4, 4, 15, 10, null, 'Zona B'),
  s(5,  'Atlético Rafaela',        22, 14, 6, 4, 4, 13, 10, null, 'Zona B'),
  s(6,  'San Martín (Tucumán)',    21, 14, 5, 6, 3, 14, 10, null, 'Zona B'),
  s(7,  'San Martín (San Juan)',   20, 14, 5, 5, 4, 14, 14, null, 'Zona B'),
  s(8,  'Deportivo Maipú',         18, 14, 5, 3, 6, 19, 16, null, 'Zona B'),
  s(9,  'Nueva Chicago',           18, 14, 4, 6, 4, 13, 12, null, 'Zona B'),
  s(10, 'Chacarita Juniors',       18, 14, 5, 3, 6, 12, 14, null, 'Zona B'),
  s(11, 'Patronato',               17, 14, 4, 5, 5,  9, 12, null, 'Zona B'),
  s(12, 'Temperley',               17, 14, 3, 8, 3, 10, 14, null, 'Zona B'),
  s(13, 'Gimnasia y Tiro (Salta)', 16, 14, 4, 4, 6, 14, 17, null, 'Zona B'),
  s(14, 'Colegiales',              16, 14, 4, 4, 6, 12, 15, null, 'Zona B'),
  s(15, 'Agropecuario',            16, 14, 4, 4, 6, 12, 17, null, 'Zona B'),
  s(16, 'Güemes',                  16, 14, 4, 4, 6, 15, 21, null, 'Zona B'),
  s(17, 'Quilmes',                 14, 14, 3, 5, 6, 12, 11, null, 'Zona B'),
  s(18, 'Almagro',                 12, 14, 3, 3, 8,  9, 18, 'Relegation', 'Zona B'),
];

// ═══════════════════════════════════════════════════════════════
// 🇪🇸  LA LIGA 2025-26  (Final — Temporada completada)
//       CAMPEÓN: F.C. Barcelona (94 pts)
// ═══════════════════════════════════════════════════════════════
export const LALIGA: SR[] = [
  s(1,  'FC Barcelona 🏆',   94, 38, 31, 1,  6, 95, 36, 'Champions League'),
  s(2,  'Real Madrid',       86, 38, 27, 5,  6, 77, 35, 'Champions League'),
  s(3,  'Villarreal',        72, 38, 22, 6, 10, 72, 46, 'Champions League'),
  s(4,  'Atlético de Madrid',69, 38, 21, 6, 11, 62, 44, 'Champions League'),
  s(5,  'Real Betis',        60, 38, 15,15,  8, 59, 48, 'Europa League'),
  s(6,  'Celta de Vigo',     54, 38, 14,12, 12, 53, 48, 'Europa League'),
  s(7,  'Getafe',            51, 38, 15, 6, 17, 32, 38, 'Conference League'),
  s(8,  'Rayo Vallecano',    50, 38, 12,14, 12, 41, 44),
  s(9,  'Valencia',          49, 38, 13,10, 15, 46, 55),
  s(10, 'Real Sociedad',     46, 38, 11,13, 14, 59, 61),
  s(11, 'Espanyol',          46, 38, 12,10, 16, 43, 55),
  s(12, 'Athletic Club',     45, 38, 13, 6, 19, 43, 58),
  s(13, 'Sevilla',           43, 38, 12, 7, 19, 46, 60),
  s(14, 'Alavés',            43, 38, 11,10, 17, 44, 56),
  s(15, 'Elche',             43, 38, 10,13, 15, 49, 57),
];

export const LALIGA_SCORERS: StaticScorer[] = [
  sc('Kylian Mbappé',    'Real Madrid',  25),
  sc('Vedat Muriqi',     '—',            23),
  sc('Ante Budimir',     '—',            17),
  sc('R. Lewandowski',   'FC Barcelona', 11),
];

// ═══════════════════════════════════════════════════════════════
// 🏴󠁧󠁢󠁥󠁮󠁧󠁿  PREMIER LEAGUE 2025-26  (Final — Temporada completada)
//       CAMPEÓN: Arsenal F.C. (85 pts — 4º título)
// ═══════════════════════════════════════════════════════════════
export const PREMIER: SR[] = [
  s(1,  'Arsenal 🏆',         85, 38, 26, 7,  5,  80, 36, 'Champions League'),
  s(2,  'Manchester City',    78, 38, 23, 9,  6,  85, 43, 'Champions League'),
  s(3,  'Manchester United',  71, 38, 20,11,  7,  62, 43, 'Champions League'),
  s(4,  'Aston Villa',        65, 38, 19, 8, 11,  55, 48, 'Champions League'),
  s(5,  'Liverpool',          60, 38, 17, 9, 12,  57, 47, 'Champions League'),
  s(6,  'Bournemouth',        57, 38, 13,18,  7,  55, 51, 'Europa League'),
  s(7,  'Sunderland',         54, 38, 14,12, 12,  42, 48, 'Europa League'),
  s(8,  'Brighton',           53, 38, 14,11, 13,  50, 44, 'Conference League'),
  s(9,  'Brentford',          53, 38, 14,11, 13,  56, 53),
  s(10, 'Chelsea',            52, 38, 14,10, 14,  58, 52),
  s(11, 'Fulham',             52, 38, 14,10, 14,  48, 52),
  s(12, 'Newcastle United',   49, 38, 13,10, 15,  44, 46),
  s(13, 'Everton',            49, 38, 13,10, 15,  45, 48),
  s(14, 'Leeds United',       47, 38, 12,11, 15,  42, 49),
  s(15, 'Crystal Palace',     45, 38, 11,12, 15,  38, 49),
  s(16, 'Nottingham Forest',  44, 38, 11,11, 16,  40, 43),
  s(17, 'Tottenham Hotspur',  41, 38, 10,11, 17,  40, 49),
  s(18, 'West Ham United',    39, 38,  9,12, 17,  35, 54, 'Relegation'),
  s(19, 'Burnley',            22, 38,  4,10, 24,  24, 61, 'Relegation'),
  s(20, 'Wolverhampton',      20, 38,  3,11, 24,  21, 62, 'Relegation'),
];

export const PREMIER_SCORERS: StaticScorer[] = [
  sc('Erling Haaland',     'Manchester City',    27),
  sc('Igor Thiago',        'Brentford',          22),
  sc('Antoine Semenyo',    'Bournemouth',        17),
  sc('Morgan Gibbs-White', 'Nottingham Forest',  15),
];

// ═══════════════════════════════════════════════════════════════
// 🇮🇹  SERIE A 2025-26  (Final — Temporada completada)
//       CAMPEÓN: Inter (87 pts — 21º título)
// ═══════════════════════════════════════════════════════════════
export const SERIE_A: SR[] = [
  s(1,  'Inter 🏆',         87, 38, 27, 6,  5, 82, 24, 'Champions League'),
  s(2,  'Napoli',           76, 38, 23, 7,  8, 63, 40, 'Champions League'),
  s(3,  'Roma',             73, 38, 23, 4, 11, 60, 45, 'Champions League'),
  s(4,  'Como',             71, 38, 20,11,  7, 58, 40, 'Champions League'),
  s(5,  'AC Milan',         70, 38, 20,10,  8, 60, 44, 'Europa League'),
  s(6,  'Juventus',         69, 38, 19,12,  7, 54, 37, 'Europa League'),
  s(7,  'Atalanta',         59, 38, 15,14,  9, 56, 43, 'Conference League'),
  s(8,  'Bologna',          56, 38, 16, 8, 14, 48, 46),
  s(9,  'Lazio',            54, 38, 14,12, 12, 48, 47),
  s(10, 'Udinese',          50, 38, 14, 8, 16, 42, 49),
  s(11, 'Sassuolo',         49, 38, 14, 7, 17, 42, 51),
  s(12, 'Parma',            45, 38, 11,12, 15, 38, 51),
  s(13, 'Torino',           45, 38, 12, 9, 17, 40, 53),
  s(14, 'Cagliari',         43, 38, 11,10, 17, 38, 52),
  s(15, 'Fiorentina',       42, 38,  9,15, 14, 38, 49),
  s(16, 'Genoa',            41, 38, 10,11, 17, 35, 52),
  s(17, 'Lecce',            38, 38, 10, 8, 20, 34, 55),
  s(18, 'Cremonese',        34, 38,  8,10, 20, 30, 60, 'Relegation'),
  s(19, 'Hellas Verona',    21, 38,  3,12, 23, 23, 68, 'Relegation'),
  s(20, 'Pisa',             18, 38,  2,12, 24, 20, 73, 'Relegation'),
];

export const SERIE_A_SCORERS: StaticScorer[] = [
  sc('Lautaro Martínez', 'Inter',  17),
  sc('Victor Osimhen',   'Napoli', 15),
  sc('Marcus Thuram',    'Inter',  14),
];

// ═══════════════════════════════════════════════════════════════
// 🌎  COPA LIBERTADORES 2026  (Fase de Grupos — Fecha 5/6)
// ═══════════════════════════════════════════════════════════════
const lib_grp = (rank: number, name: string, pts: number, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, grp: string): SR => {
  const desc = rank === 1 ? 'Champions League' : rank === 2 ? 'Europa League' : null;
  return s(rank, name, pts, pj, pg, pe, pp, gf, gc, desc ?? undefined, grp);
};

export const LIBERTADORES_GROUPS: SR[][] = [
  [ // Grupo A
    lib_grp(1, '🇧🇷 Flamengo',           10, 4, 3, 1, 0,  8,  2, 'Grupo A'),
    lib_grp(2, '🇨🇴 Ind. Medellín',        7, 4, 2, 1, 1,  6,  7, 'Grupo A'),
    lib_grp(3, '🇦🇷 Estudiantes (LP)',      6, 5, 1, 3, 1,  5,  5, 'Grupo A'),
    lib_grp(4, '🇵🇪 Cusco FC',             1, 5, 0, 1, 4,  4,  9, 'Grupo A'),
  ],
  [ // Grupo B
    lib_grp(1, '🇨🇱 Coquimbo Unido',      10, 5, 3, 1, 1,  8,  5, 'Grupo B'),
    lib_grp(2, '🇨🇴 Dep. Tolima',          7, 5, 2, 1, 2,  7,  6, 'Grupo B'),
    lib_grp(3, '🇵🇪 Universitario',         5, 5, 1, 2, 2,  5,  6, 'Grupo B'),
    lib_grp(4, '🇺🇾 Nacional',             5, 5, 1, 2, 2,  6,  9, 'Grupo B'),
  ],
  [ // Grupo C
    lib_grp(1, '🇦🇷 Ind. Rivadavia',      10, 4, 3, 1, 0,  8,  3, 'Grupo C'),
    lib_grp(2, '🇧🇴 Bolívar',              5, 5, 1, 2, 2,  5,  5, 'Grupo C'),
    lib_grp(3, '🇧🇷 Fluminense',           5, 5, 1, 2, 2,  4,  6, 'Grupo C'),
    lib_grp(4, '🇻🇪 Dep. La Guaira',       3, 4, 0, 3, 1,  3,  6, 'Grupo C'),
  ],
  [ // Grupo D
    lib_grp(1, '🇨🇱 U. Católica',         10, 5, 3, 1, 1,  7,  4, 'Grupo D'),
    lib_grp(2, '🇧🇷 Cruzeiro',             8, 5, 2, 2, 1,  4,  3, 'Grupo D'),
    lib_grp(3, '🇦🇷 Boca Juniors',          7, 5, 2, 1, 2,  6,  4, 'Grupo D'),
    lib_grp(4, '🇪🇨 Barcelona SC',          3, 5, 1, 0, 4,  2,  8, 'Grupo D'),
  ],
  [ // Grupo E
    lib_grp(1, '🇧🇷 Corinthians',         11, 5, 3, 2, 0,  8,  2, 'Grupo E'),
    lib_grp(2, '🇦🇷 Platense',             7, 5, 2, 1, 2,  6,  7, 'Grupo E'),
    lib_grp(3, '🇨🇴 Ind. Santa Fe',        5, 5, 1, 2, 2,  5,  7, 'Grupo E'),
    lib_grp(4, '🇺🇾 Peñarol',              3, 5, 0, 3, 2,  4,  7, 'Grupo E'),
  ],
  [ // Grupo F
    lib_grp(1, '🇵🇾 Cerro Porteño',       10, 5, 3, 1, 1,  4,  2, 'Grupo F'),
    lib_grp(2, '🇧🇷 Palmeiras',            8, 5, 2, 2, 1,  6,  4, 'Grupo F'),
    lib_grp(3, '🇵🇪 Sporting Cristal',     6, 5, 2, 0, 3,  6,  7, 'Grupo F'),
    lib_grp(4, '🇨🇴 Atlético Junior',      4, 5, 1, 1, 3,  4,  7, 'Grupo F'),
  ],
  [ // Grupo G
    lib_grp(1, '🇧🇷 Mirassol',            12, 5, 4, 0, 1,  7,  3, 'Grupo G'),
    lib_grp(2, '🇪🇨 LDU Quito',            9, 5, 3, 0, 2,  5,  3, 'Grupo G'),
    lib_grp(3, '🇦🇷 Lanús',               6, 5, 2, 0, 3,  2,  7, 'Grupo G'),
    lib_grp(4, '🇧🇴 Always Ready',         3, 5, 1, 0, 4,  5,  6, 'Grupo G'),
  ],
  [ // Grupo H
    lib_grp(1, '🇦🇷 Rosario Central',     13, 5, 4, 1, 0,  9,  1, 'Grupo H'),
    lib_grp(2, '🇪🇨 Ind. del Valle',      10, 5, 3, 1, 1, 10,  6, 'Grupo H'),
    lib_grp(3, '🇻🇪 U. Central',           6, 5, 2, 0, 3,  7, 11, 'Grupo H'),
    lib_grp(4, '🇵🇾 Libertad',             0, 5, 0, 0, 5,  4, 12, 'Grupo H'),
  ],
];

// ═══════════════════════════════════════════════════════════════
// 🌍  COPA SUDAMERICANA 2026  (Fase de Grupos — Fecha 5/6)
// ═══════════════════════════════════════════════════════════════
export const SUDAMERICANA_GROUPS: SR[][] = [
  [ // Grupo A
    lib_grp(1, '🇪🇨 Macará',              9, 5, 2, 3, 0,  6,  3, 'Grupo A'),
    lib_grp(2, '🇨🇴 América de Cali',     8, 5, 2, 2, 1,  6,  5, 'Grupo A'),
    lib_grp(3, '🇦🇷 Tigre',               6, 5, 1, 3, 1,  6,  5, 'Grupo A'),
    lib_grp(4, '🇵🇪 Alianza Atlético',    2, 5, 0, 2, 3,  2,  7, 'Grupo A'),
  ],
  [ // Grupo B
    lib_grp(1, '🇻🇪 A. Puerto Cabello',  7, 5, 2, 1, 2,  6,  8, 'Grupo B'),
    lib_grp(2, '🇵🇪 Cienciano',           7, 5, 2, 1, 2,  4,  6, 'Grupo B'),
    lib_grp(3, '🇧🇷 Atlético Mineiro',    7, 5, 2, 1, 2,  7,  6, 'Grupo B'),
    lib_grp(4, '🇺🇾 Juventud',            6, 5, 1, 3, 1,  9,  6, 'Grupo B'),
  ],
  [ // Grupo C
    lib_grp(1, '🇧🇷 São Paulo',           9, 5, 2, 3, 0,  4,  1, 'Grupo C'),
    lib_grp(2, '🇨🇴 Millonarios',         8, 5, 2, 2, 1,  5,  4, 'Grupo C'),
    lib_grp(3, '🇨🇱 O\'Higgins',          7, 5, 2, 1, 2,  6,  5, 'Grupo C'),
    lib_grp(4, '🇺🇾 Boston River',        3, 5, 1, 0, 4,  5, 10, 'Grupo C'),
  ],
  [ // Grupo D
    lib_grp(1, '🇦🇷 San Lorenzo',         7, 5, 1, 4, 0,  6,  4, 'Grupo D'),
    lib_grp(2, '🇪🇨 Dep. Cuenca',         6, 5, 1, 3, 1,  3,  4, 'Grupo D'),
    lib_grp(3, '🇨🇱 Dep. Recoleta',       5, 5, 0, 5, 0,  5,  5, 'Grupo D'),
    lib_grp(4, '🇧🇷 Santos',              4, 5, 0, 4, 1,  5,  6, 'Grupo D'),
  ],
  [ // Grupo E
    lib_grp(1, '🇧🇷 Botafogo',           13, 5, 4, 1, 0, 12,  4, 'Grupo E'),
    lib_grp(2, '🇻🇪 Caracas FC',          9, 5, 2, 3, 0,  8,  6, 'Grupo E'),
    lib_grp(3, '🇦🇷 Racing Club',          5, 5, 1, 2, 2,  9,  9, 'Grupo E'),
    lib_grp(4, '🇧🇴 Ind. Petrolero',      0, 5, 0, 0, 5,  3, 13, 'Grupo E'),
  ],
  [ // Grupo F
    lib_grp(1, '🇺🇾 Mv. City Torque',    12, 5, 4, 0, 1,  9,  3, 'Grupo F'),
    lib_grp(2, '🇧🇷 Grêmio',             10, 5, 3, 1, 1,  6,  1, 'Grupo F'),
    lib_grp(3, '🇦🇷 Dep. Riestra',        4, 5, 1, 1, 3,  3,  8, 'Grupo F'),
    lib_grp(4, '🇨🇱 Palestino',           2, 5, 0, 2, 3,  0,  3, 'Grupo F'),
  ],
  [ // Grupo G
    lib_grp(1, '🇧🇷 Vasco da Gama',      10, 5, 3, 1, 1,  7,  5, 'Grupo G'),
    lib_grp(2, '🇵🇾 Olimpia',             7, 5, 2, 1, 2,  7,  6, 'Grupo G'),
    lib_grp(3, '🇨🇱 Audax Italiano',      7, 5, 2, 1, 2,  6,  6, 'Grupo G'),
    lib_grp(4, '🇦🇷 Barracas Central',    3, 5, 0, 3, 2,  2,  5, 'Grupo G'),
  ],
  [ // Grupo H
    lib_grp(1, '🇦🇷 River Plate',        11, 5, 3, 2, 0,  6,  3, 'Grupo H'),
    lib_grp(2, '🇻🇪 Carabobo',            9, 5, 3, 1, 1,  6,  3, 'Grupo H'),
    lib_grp(3, '🇧🇷 RB Bragantino',       7, 5, 2, 1, 2, 10,  5, 'Grupo H'),
    lib_grp(4, '🇧🇴 Blooming',            1, 5, 0, 1, 4,  3, 14, 'Grupo H'),
  ],
];

// ═══════════════════════════════════════════════════════════════
// 🇺🇸  MLS 2026  (Fecha ~14/15 — Temporada en curso)
// ═══════════════════════════════════════════════════════════════
export const MLS_EAST: SR[] = [
  s(1,  'Nashville SC',          33, 14, 10, 3,  1, 31, 11, 'Champions League', 'Conferencia Este'),
  s(2,  'Inter Miami CF',        28, 14,  8, 4,  2, 33, 24, 'Champions League', 'Conferencia Este'),
  s(3,  'Chicago Fire FC',       26, 14,  8, 2,  4, 27, 16, 'Champions League', 'Conferencia Este'),
  s(4,  'New England Rev.',      25, 14,  8, 1,  5, 22, 18, 'Champions League', 'Conferencia Este'),
  s(5,  'NY Red Bulls',          22, 15,  6, 4,  5, 25, 32, 'Champions League', 'Conferencia Este'),
  s(6,  'Charlotte FC',          21, 15,  6, 3,  6, 24, 23, 'Champions League', 'Conferencia Este'),
  s(7,  'FC Cincinnati',         20, 15,  5, 5,  5, 36, 37, 'Champions League', 'Conferencia Este'),
  s(8,  'New York City FC',      19, 15,  5, 4,  6, 25, 21, null, 'Conferencia Este'),
  s(9,  'D.C. United',           18, 15,  4, 6,  5, 21, 25, null, 'Conferencia Este'),
  s(10, 'CF Montréal',           14, 14,  4, 2,  8, 22, 31, null, 'Conferencia Este'),
  s(11, 'Orlando City SC',       14, 15,  4, 2,  9, 23, 44, null, 'Conferencia Este'),
  s(12, 'Toronto FC',            14, 14,  3, 5,  6, 22, 29, null, 'Conferencia Este'),
  s(13, 'Columbus Crew',         13, 14,  3, 4,  7, 19, 23, null, 'Conferencia Este'),
  s(14, 'Atlanta United FC',     11, 13,  3, 2,  8, 14, 21, null, 'Conferencia Este'),
  s(15, 'Philadelphia Union',     7, 14,  1, 4,  9, 14, 24, null, 'Conferencia Este'),
];

export const MLS_WEST: SR[] = [
  s(1,  'Vancouver Whitecaps',   32, 14, 10, 2,  2, 34, 12, 'Champions League', 'Conferencia Oeste'),
  s(2,  'San Jose Earthquakes',  32, 15, 10, 2,  3, 34, 15, 'Champions League', 'Conferencia Oeste'),
  s(3,  'Real Salt Lake',        26, 14,  8, 2,  4, 26, 19, 'Champions League', 'Conferencia Oeste'),
  s(4,  'FC Dallas',             25, 15,  7, 4,  4, 30, 22, 'Champions League', 'Conferencia Oeste'),
  s(5,  'Seattle Sounders FC',   24, 12,  7, 3,  2, 17, 10, 'Champions League', 'Conferencia Oeste'),
  s(6,  'Houston Dynamo FC',     22, 14,  7, 1,  6, 19, 23, 'Champions League', 'Conferencia Oeste'),
  s(7,  'Minnesota United FC',   22, 15,  6, 4,  5, 18, 22, 'Champions League', 'Conferencia Oeste'),
  s(8,  'Los Angeles FC',        21, 14,  6, 3,  5, 23, 17, null, 'Conferencia Oeste'),
  s(9,  'LA Galaxy',             20, 15,  5, 5,  5, 22, 22, null, 'Conferencia Oeste'),
  s(10, 'San Diego FC',          17, 15,  4, 5,  6, 30, 27, null, 'Conferencia Oeste'),
  s(11, 'Colorado Rapids',       16, 15,  5, 1,  9, 25, 24, null, 'Conferencia Oeste'),
  s(12, 'St. Louis City SC',     16, 14,  4, 4,  6, 16, 20, null, 'Conferencia Oeste'),
  s(13, 'Portland Timbers',      14, 14,  4, 2,  8, 22, 28, null, 'Conferencia Oeste'),
  s(14, 'Austin FC',             14, 15,  3, 5,  7, 19, 31, null, 'Conferencia Oeste'),
  s(15, 'Sporting Kansas City',  11, 14,  3, 2,  9, 14, 36, null, 'Conferencia Oeste'),
];

export const MLS_SCORERS: StaticScorer[] = [
  sc('Hugo Cuypers',      'Chicago Fire FC',     13),
  sc('Lionel Messi',      'Inter Miami CF',      12),
  sc('Marcus Ingvartsen', 'San Diego FC',        11),
  sc('Preston Judd',      'San Jose Earthquakes',11),
];

// ═══════════════════════════════════════════════════════════════
// 🌍  COPA MUNDIAL FIFA 2026 — Grupos (11 jun – 19 jul)
//     48 equipos · 12 grupos de 4 · 🇲🇽🇨🇦🇺🇸
// ═══════════════════════════════════════════════════════════════
const wg = (rank: number, name: string, grp: string): SR =>
  s(rank, name, 0, 0, 0, 0, 0, 0, 0, undefined, grp);

export const MUNDIAL_GROUPS: SR[][] = [
  [wg(1,'🇲🇽 México',          'Grupo A'), wg(2,'🇿🇦 Sudáfrica',     'Grupo A'), wg(3,'🇰🇷 Corea del Sur',  'Grupo A'), wg(4,'🇨🇿 Rep. Checa',      'Grupo A')],
  [wg(1,'🇨🇦 Canadá',          'Grupo B'), wg(2,'🇧🇦 Bosnia-Herz.',   'Grupo B'), wg(3,'🇶🇦 Qatar',          'Grupo B'), wg(4,'🇨🇭 Suiza',           'Grupo B')],
  [wg(1,'🇧🇷 Brasil',          'Grupo C'), wg(2,'🇲🇦 Marruecos',     'Grupo C'), wg(3,'🇭🇹 Haití',          'Grupo C'), wg(4,'🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia',         'Grupo C')],
  [wg(1,'🇺🇸 Estados Unidos',  'Grupo D'), wg(2,'🇵🇾 Paraguay',      'Grupo D'), wg(3,'🇦🇺 Australia',      'Grupo D'), wg(4,'🇹🇷 Turquía',        'Grupo D')],
  [wg(1,'🇩🇪 Alemania',        'Grupo E'), wg(2,'🇨🇼 Curazao',       'Grupo E'), wg(3,'🇨🇮 Costa de Marfil','Grupo E'), wg(4,'🇪🇨 Ecuador',         'Grupo E')],
  [wg(1,'🇳🇱 Países Bajos',    'Grupo F'), wg(2,'🇯🇵 Japón',         'Grupo F'), wg(3,'🇸🇪 Suecia',         'Grupo F'), wg(4,'🇹🇳 Túnez',           'Grupo F')],
  [wg(1,'🇧🇪 Bélgica',         'Grupo G'), wg(2,'🇪🇬 Egipto',        'Grupo G'), wg(3,'🇮🇷 Irán',           'Grupo G'), wg(4,'🇳🇿 Nueva Zelanda',  'Grupo G')],
  [wg(1,'🇪🇸 España',          'Grupo H'), wg(2,'🇨🇻 Cabo Verde',    'Grupo H'), wg(3,'🇸🇦 Arabia Saudita', 'Grupo H'), wg(4,'🇺🇾 Uruguay',         'Grupo H')],
  [wg(1,'🇫🇷 Francia',         'Grupo I'), wg(2,'🇸🇳 Senegal',       'Grupo I'), wg(3,'🇮🇶 Iraq',           'Grupo I'), wg(4,'🇳🇴 Noruega',         'Grupo I')],
  [wg(1,'🇦🇷 Argentina',       'Grupo J'), wg(2,'🇩🇿 Argelia',       'Grupo J'), wg(3,'🇦🇹 Austria',        'Grupo J'), wg(4,'🇯🇴 Jordania',        'Grupo J')],
  [wg(1,'🇵🇹 Portugal',        'Grupo K'), wg(2,'🇨🇩 R.D. Congo',    'Grupo K'), wg(3,'🇺🇿 Uzbekistán',     'Grupo K'), wg(4,'🇨🇴 Colombia',        'Grupo K')],
  [wg(1,'🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra',      'Grupo L'), wg(2,'🇭🇷 Croacia',       'Grupo L'), wg(3,'🇬🇭 Ghana',          'Grupo L'), wg(4,'🇵🇦 Panamá',         'Grupo L')],
];

// ═══════════════════════════════════════════════════════════════
// MAPA GLOBAL por league ID
// ═══════════════════════════════════════════════════════════════
export const STATIC_STANDINGS: Record<number, SR[][]> = {
  128: [LPF_ZONA_A, LPF_ZONA_B],         // Liga Profesional
  131: [PN_ZONA_A, PN_ZONA_B],            // Primera Nacional
  130: [],                                 // Copa Argentina (no standings)
  140: [LALIGA],                           // La Liga
  39:  [PREMIER],                          // Premier League
  135: [SERIE_A],                          // Serie A
  13:  LIBERTADORES_GROUPS,               // Copa Libertadores
  11:  SUDAMERICANA_GROUPS,               // Copa Sudamericana
  253: [MLS_EAST, MLS_WEST],              // MLS
  1:   MUNDIAL_GROUPS,                    // World Cup
  2:   [],                                 // Champions League (brackets)
  3:   [],                                 // Europa League
};

export const STATIC_SCORERS: Record<number, StaticScorer[]> = {
  128: LPF_SCORERS,
  140: LALIGA_SCORERS,
  39:  PREMIER_SCORERS,
  135: SERIE_A_SCORERS,
  253: MLS_SCORERS,
};

export const STATIC_FIXTURES: Record<number, StaticFixture[]> = {
  130: COPA_ARG_FIXTURES,
};
