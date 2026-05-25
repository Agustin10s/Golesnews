/**
 * RSS scraper para auto-publicación de artículos
 * Descarga feeds RSS de TyC Sports, El Gráfico, ESPN Argentina
 * y usa IA para reescribir el contenido
 */

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i').exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  return plain ? plain[1].replace(/<[^>]+>/g, '').trim() : '';
}

function extractImage(xml: string): string {
  const mediaContent = /media:content[^>]+url="([^"]+)"/i.exec(xml);
  if (mediaContent) return mediaContent[1];
  const enclosure = /enclosure[^>]+url="([^"]+)"/i.exec(xml);
  if (enclosure) return enclosure[1];
  const imgInContent = /<img[^>]+src="([^"]+)"/i.exec(xml);
  if (imgInContent) return imgInContent[1];
  return '';
}

export async function fetchRssFeed(url: string, maxItems = 8): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GolesNews/1.0 RSS Reader' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RssItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
      const block = match[1];
      const title = extractTag(block, 'title');
      const link  = extractTag(block, 'link') || extractTag(block, 'guid');
      const desc  = extractTag(block, 'description') || extractTag(block, 'content:encoded');
      const date  = extractTag(block, 'pubDate');
      const image = extractImage(block);

      if (title && link) {
        items.push({ title, link, description: desc, pubDate: date, image });
      }
    }
    return items;
  } catch (e) {
    console.error(`RSS fetch error for ${url}:`, e);
    return [];
  }
}

/** Fetch full article content from a URL (best-effort) */
export async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 GolesNews' },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Extract main article text using common patterns
    const patterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]+class="[^"]*(?:article|nota|content|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+id="[^"]*(?:article|nota|content|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    for (const p of patterns) {
      const m = p.exec(html);
      if (m) {
        const text = m[1].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (text.length > 200) return text.slice(0, 3000);
      }
    }
    return '';
  } catch {
    return '';
  }
}
