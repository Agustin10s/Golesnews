/**
 * CMS Database — SQLite via better-sqlite3
 * DB path: CMS_DB_PATH env var (default: ./cms.db)
 * Para persistencia en Railway: montar volumen en /data y setear CMS_DB_PATH=/data/cms.db
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.CMS_DB_PATH || path.join(process.cwd(), 'cms.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// eslint-disable-next-line no-var
declare global { var __cmsDb: Database.Database | undefined }

function openDb(): Database.Database {
  const db = new Database(DB_PATH, { timeout: 8000 }); // wait up to 8s if locked
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 8000');
  return db;
}

const db: Database.Database = globalThis.__cmsDb ?? (globalThis.__cmsDb = openDb());

// ── SCHEMA ──────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    name      TEXT NOT NULL DEFAULT '',
    role      TEXT NOT NULL DEFAULT 'editor',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS articles (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT NOT NULL,
    slug           TEXT UNIQUE NOT NULL,
    excerpt        TEXT NOT NULL DEFAULT '',
    copete         TEXT NOT NULL DEFAULT '',
    content        TEXT NOT NULL DEFAULT '',
    category       TEXT NOT NULL DEFAULT 'futbol',
    tags           TEXT NOT NULL DEFAULT '[]',
    status         TEXT NOT NULL DEFAULT 'draft',
    featured_image TEXT NOT NULL DEFAULT '',
    author_id      INTEGER REFERENCES users(id),
    seo_title      TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    seo_keywords   TEXT NOT NULL DEFAULT '',
    source_url     TEXT NOT NULL DEFAULT '',
    source_name    TEXT NOT NULL DEFAULT '',
    views          INTEGER NOT NULL DEFAULT 0,
    published_at   TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS media (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    original_name TEXT NOT NULL DEFAULT '',
    url           TEXT NOT NULL,
    mime_type     TEXT NOT NULL DEFAULT '',
    size          INTEGER NOT NULL DEFAULT 0,
    author_id     INTEGER REFERENCES users(id),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scraper_settings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name     TEXT UNIQUE NOT NULL,
    rss_url         TEXT NOT NULL,
    enabled         INTEGER NOT NULL DEFAULT 1,
    auto_publish    INTEGER NOT NULL DEFAULT 0,
    category        TEXT NOT NULL DEFAULT 'futbol',
    last_run        TEXT,
    articles_added  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    slug       TEXT UNIQUE NOT NULL,
    label      TEXT NOT NULL,
    color      TEXT NOT NULL DEFAULT '#e8353a',
    ord        INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    placement   TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'image',
    content     TEXT NOT NULL DEFAULT '',
    link_url    TEXT NOT NULL DEFAULT '',
    enabled     INTEGER NOT NULL DEFAULT 1,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS page_views (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    path       TEXT NOT NULL,
    article_id INTEGER,
    referrer   TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migrations — idempotent
try { db.exec(`ALTER TABLE articles ADD COLUMN copete       TEXT NOT NULL DEFAULT ''`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE articles ADD COLUMN section      TEXT NOT NULL DEFAULT ''`); } catch { /* already exists */ }
try { db.exec(`ALTER TABLE articles ADD COLUMN subcategory  TEXT NOT NULL DEFAULT ''`); } catch { /* already exists */ }

// ── SEED: idempotent — uses INSERT OR IGNORE ──────────────────

try {
  const hash = bcrypt.hashSync('golesnews2026', 10);
  db.prepare(`INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?,?,?,?)`)
    .run('admin', hash, 'Administrador', 'admin');

  const ins = db.prepare(`INSERT OR IGNORE INTO scraper_settings (source_name,rss_url,enabled,category) VALUES (?,?,?,?)`);
  ins.run('TyC Sports',    'https://www.tycsports.com/rss.xml',       1, 'futbol');
  ins.run('El Gráfico',    'https://www.elgrafico.com.ar/rss/home.xml', 1, 'futbol');
  ins.run('ESPN Argentina','https://www.espn.com.ar/espn/rss/news',    1, 'futbol');

  // Seed default categories
  const catIns = db.prepare(`INSERT OR IGNORE INTO categories (slug,label,color,ord) VALUES (?,?,?,?)`);
  catIns.run('futbol',          'Fútbol',             '#e8353a', 1);
  catIns.run('argentina',       'Argentina',          '#3b82f6', 2);
  catIns.run('internacional',   'Internacional',      '#8b5cf6', 3);
  catIns.run('champions-league','Champions League',   '#d4af37', 4);
  catIns.run('libertadores',    'Copa Libertadores',  '#10b981', 5);
  catIns.run('mls',             'MLS',                '#f59e0b', 6);
  catIns.run('editorial',       'Editorial',          '#6b7280', 7);
  catIns.run('transfers',       'Pases & Mercado',    '#06b6d4', 8);
  catIns.run('lesiones',        'Lesiones',           '#ef4444', 9);
  catIns.run('europa',          'Europa',             '#a855f7', 10);
  catIns.run('mundial',         'Mundial 2026',       '#f97316', 11);
} catch { /* already seeded */ }

// ── USER QUERIES ─────────────────────────────────────────────

export interface User {
  id: number; username: string; password: string;
  name: string; role: string; created_at: string;
}

export const userDb = {
  findByUsername: (username: string) =>
    db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined,
  findById: (id: number) =>
    db.prepare('SELECT id,username,name,role,created_at FROM users WHERE id = ?').get(id) as Omit<User, 'password'> | undefined,
  list: () =>
    db.prepare('SELECT id,username,name,role,created_at FROM users ORDER BY id').all() as Omit<User, 'password'>[],
  create: (username: string, plainPassword: string, name: string, role = 'editor') => {
    const hash = bcrypt.hashSync(plainPassword, 10);
    return db.prepare('INSERT INTO users (username,password,name,role) VALUES (?,?,?,?)').run(username, hash, name, role);
  },
  updatePassword: (id: number, newPlain: string) => {
    const hash = bcrypt.hashSync(newPlain, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id);
  },
};

// ── ARTICLE QUERIES ──────────────────────────────────────────

export interface Article {
  id: number; title: string; slug: string; excerpt: string;
  content: string; category: string; tags: string; status: string;
  featured_image: string; author_id: number | null;
  seo_title: string; seo_description: string; seo_keywords: string;
  source_url: string; source_name: string; views: number;
  published_at: string | null; created_at: string; updated_at: string;
}

export interface ArticleInput {
  title: string; slug: string; excerpt?: string; copete?: string; content: string;
  category: string; tags?: string[]; status?: string;
  featured_image?: string; author_id?: number;
  seo_title?: string; seo_description?: string; seo_keywords?: string;
  source_url?: string; source_name?: string;
  section?: string; subcategory?: string;
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

export function uniqueSlug(base: string): string {
  const s = slugify(base);
  const exists = db.prepare('SELECT id FROM articles WHERE slug = ?').get(s);
  if (!exists) return s;
  const ts = Date.now().toString(36);
  return `${s}-${ts}`;
}

export const articleDb = {
  list: (opts: { status?: string; category?: string; limit?: number; offset?: number } = {}) => {
    let q = `SELECT a.*, u.name as author_name
      FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE 1=1`;
    const params: (string | number)[] = [];
    if (opts.status)   { q += ' AND a.status = ?';   params.push(opts.status); }
    if (opts.category) { q += ' AND a.category = ?'; params.push(opts.category); }
    q += ' ORDER BY a.created_at DESC';
    q += ` LIMIT ${opts.limit ?? 50} OFFSET ${opts.offset ?? 0}`;
    return db.prepare(q).all(...params) as (Article & { author_name: string })[];
  },
  count: (opts: { status?: string; category?: string } = {}) => {
    let q = 'SELECT COUNT(*) as c FROM articles WHERE 1=1';
    const params: string[] = [];
    if (opts.status)   { q += ' AND status = ?';   params.push(opts.status); }
    if (opts.category) { q += ' AND category = ?'; params.push(opts.category); }
    return (db.prepare(q).get(...params) as { c: number }).c;
  },
  findById: (id: number) =>
    db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as Article | undefined,
  findBySlug: (slug: string) =>
    db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug) as Article | undefined,
  create: (data: ArticleInput) => {
    const now = new Date().toISOString();
    const r = db.prepare(`
      INSERT INTO articles
        (title,slug,excerpt,copete,content,category,tags,status,featured_image,author_id,
         seo_title,seo_description,seo_keywords,source_url,source_name,
         section,subcategory,published_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      data.title, data.slug, data.excerpt ?? '', data.copete ?? '',
      data.content, data.category,
      JSON.stringify(data.tags ?? []),
      data.status ?? 'draft',
      data.featured_image ?? '',
      data.author_id ?? null,
      data.seo_title ?? '', data.seo_description ?? '', data.seo_keywords ?? '',
      data.source_url ?? '', data.source_name ?? '',
      data.section ?? '', data.subcategory ?? '',
      data.status === 'published' ? now : null,
      now, now,
    );
    return r.lastInsertRowid as number;
  },
  update: (id: number, data: Partial<ArticleInput>) => {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const vals: unknown[] = [];
    const map: Record<string, unknown> = {
      title: data.title, slug: data.slug, excerpt: data.excerpt, copete: data.copete,
      content: data.content, category: data.category,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      status: data.status, featured_image: data.featured_image,
      seo_title: data.seo_title, seo_description: data.seo_description,
      seo_keywords: data.seo_keywords,
      section: data.section, subcategory: data.subcategory,
    };
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined) { fields.push(`${k} = ?`); vals.push(v); }
    }
    if (data.status === 'published') {
      const cur = db.prepare('SELECT published_at FROM articles WHERE id = ?').get(id) as { published_at: string | null };
      if (!cur?.published_at) { fields.push('published_at = ?'); vals.push(now); }
    }
    fields.push('updated_at = ?'); vals.push(now);
    vals.push(id);
    db.prepare(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  },
  delete: (id: number) => db.prepare('DELETE FROM articles WHERE id = ?').run(id),
  incrementViews: (id: number) => db.prepare('UPDATE articles SET views = views+1 WHERE id = ?').run(id),
};

// ── MEDIA QUERIES ────────────────────────────────────────────

export interface Media {
  id: number; filename: string; original_name: string;
  url: string; mime_type: string; size: number;
  author_id: number | null; created_at: string;
}

export const mediaDb = {
  list: () => db.prepare('SELECT * FROM media ORDER BY created_at DESC').all() as Media[],
  create: (data: Omit<Media, 'id' | 'created_at'>) =>
    db.prepare('INSERT INTO media (filename,original_name,url,mime_type,size,author_id) VALUES (?,?,?,?,?,?)').run(
      data.filename, data.original_name, data.url, data.mime_type, data.size, data.author_id ?? null,
    ).lastInsertRowid as number,
  delete: (id: number) => db.prepare('DELETE FROM media WHERE id = ?').run(id),
};

// ── SCRAPER SETTINGS ─────────────────────────────────────────

export interface ScraperSetting {
  id: number; source_name: string; rss_url: string;
  enabled: number; auto_publish: number; category: string;
  last_run: string | null; articles_added: number;
}

export const scraperDb = {
  list: () => db.prepare('SELECT * FROM scraper_settings ORDER BY id').all() as ScraperSetting[],
  update: (id: number, data: Partial<ScraperSetting>) => {
    const fields: string[] = [];
    const vals: unknown[] = [];
    const keys = ['rss_url','enabled','auto_publish','category','last_run','articles_added'] as const;
    for (const k of keys) {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); vals.push(data[k]); }
    }
    if (!fields.length) return;
    vals.push(id);
    db.prepare(`UPDATE scraper_settings SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  },
  incrementCount: (id: number, added: number) =>
    db.prepare('UPDATE scraper_settings SET articles_added = articles_added + ?, last_run = ? WHERE id = ?')
      .run(added, new Date().toISOString(), id),
};

// ── CATEGORY QUERIES ─────────────────────────────────────────

export interface Category {
  id: number; slug: string; label: string;
  color: string; ord: number; created_at: string;
}

export const categoryDb = {
  list: () => db.prepare('SELECT * FROM categories ORDER BY ord, id').all() as Category[],
  create: (slug: string, label: string, color: string, ord: number) =>
    db.prepare('INSERT INTO categories (slug,label,color,ord) VALUES (?,?,?,?)').run(slug, label, color, ord).lastInsertRowid as number,
  update: (id: number, data: Partial<Pick<Category, 'slug' | 'label' | 'color' | 'ord'>>) => {
    const fields: string[] = [];
    const vals: unknown[] = [];
    if (data.slug  !== undefined) { fields.push('slug = ?');  vals.push(data.slug);  }
    if (data.label !== undefined) { fields.push('label = ?'); vals.push(data.label); }
    if (data.color !== undefined) { fields.push('color = ?'); vals.push(data.color); }
    if (data.ord   !== undefined) { fields.push('ord = ?');   vals.push(data.ord);   }
    if (!fields.length) return;
    vals.push(id);
    db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  },
  delete: (id: number) => db.prepare('DELETE FROM categories WHERE id = ?').run(id),
};

// ── ADS QUERIES ──────────────────────────────────────────────

export interface Ad {
  id: number; name: string; placement: string; type: string;
  content: string; link_url: string; enabled: number;
  impressions: number; clicks: number; created_at: string;
}

export const adDb = {
  list: () => db.prepare('SELECT * FROM ads ORDER BY placement, id').all() as Ad[],
  listActive: (placement?: string) => {
    if (placement)
      return db.prepare('SELECT * FROM ads WHERE enabled = 1 AND placement = ? ORDER BY id').all(placement) as Ad[];
    return db.prepare('SELECT * FROM ads WHERE enabled = 1 ORDER BY placement, id').all() as Ad[];
  },
  findById: (id: number) => db.prepare('SELECT * FROM ads WHERE id = ?').get(id) as Ad | undefined,
  create: (data: Omit<Ad, 'id' | 'created_at'>) =>
    db.prepare('INSERT INTO ads (name,placement,type,content,link_url,enabled) VALUES (?,?,?,?,?,?)')
      .run(data.name, data.placement, data.type, data.content, data.link_url, data.enabled ? 1 : 0)
      .lastInsertRowid as number,
  update: (id: number, data: Partial<Omit<Ad, 'id' | 'created_at'>>) => {
    const fields: string[] = [];
    const vals: unknown[] = [];
    const map: Record<string, unknown> = {
      name: data.name, placement: data.placement, type: data.type,
      content: data.content, link_url: data.link_url, enabled: data.enabled !== undefined ? (data.enabled ? 1 : 0) : undefined,
    };
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined) { fields.push(`${k} = ?`); vals.push(v); }
    }
    if (!fields.length) return;
    vals.push(id);
    db.prepare(`UPDATE ads SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  },
  delete: (id: number) => db.prepare('DELETE FROM ads WHERE id = ?').run(id),
  trackImpression: (id: number) => db.prepare('UPDATE ads SET impressions = impressions + 1 WHERE id = ?').run(id),
  trackClick: (id: number) => db.prepare('UPDATE ads SET clicks = clicks + 1 WHERE id = ?').run(id),
};

// ── PAGE VIEWS ───────────────────────────────────────────────

export const analyticsDb = {
  track: (path: string, articleId?: number, referrer?: string) =>
    db.prepare('INSERT INTO page_views (path,article_id,referrer) VALUES (?,?,?)').run(path, articleId ?? null, referrer ?? ''),
  totalViews: (days = 30) => {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    return (db.prepare('SELECT COUNT(*) as c FROM page_views WHERE created_at > ?').get(since) as { c: number }).c;
  },
  viewsByDay: (days = 30) => {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    return db.prepare(`SELECT date(created_at) as d, COUNT(*) as c FROM page_views WHERE created_at > ? GROUP BY d ORDER BY d`)
      .all(since) as { d: string; c: number }[];
  },
  topPages: (limit = 10) =>
    db.prepare('SELECT path, COUNT(*) as c FROM page_views GROUP BY path ORDER BY c DESC LIMIT ?').all(limit) as { path: string; c: number }[],
  topArticles: (limit = 10) =>
    db.prepare(`SELECT a.id, a.title, a.slug, a.category, a.views FROM articles a WHERE a.status='published' ORDER BY a.views DESC LIMIT ?`)
      .all(limit) as { id: number; title: string; slug: string; category: string; views: number }[],
  viewsByCategory: () =>
    db.prepare(`SELECT category, SUM(views) as total FROM articles WHERE status='published' GROUP BY category ORDER BY total DESC`)
      .all() as { category: string; total: number }[],
};

export default db;
