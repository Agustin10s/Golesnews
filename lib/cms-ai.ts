/**
 * AI integration para el CMS — usa Claude (Anthropic) o fallback simple
 * Requiere: ANTHROPIC_API_KEY en variables de entorno
 */
import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

async function ask(prompt: string, maxTokens = 1024): Promise<string> {
  const client = getClient();
  if (!client) throw new Error('ANTHROPIC_API_KEY no configurada');
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

// ── SEO OPTIMIZATION ─────────────────────────────────────────

export interface SeoResult {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  tags: string[];
  slug_suggestion: string;
}

export async function optimizeSeo(title: string, content: string, category: string): Promise<SeoResult> {
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 800);
  const prompt = `Eres un experto en SEO para medios deportivos digitales de Argentina.
Analizá el siguiente artículo y generá metadatos SEO optimizados para posicionar en Google News y Google Discover.

TÍTULO: ${title}
CATEGORÍA: ${category}
EXTRACTO DE CONTENIDO: ${plainText}

Respondé ÚNICAMENTE con un objeto JSON válido (sin texto extra, sin markdown) con esta estructura exacta:
{
  "seo_title": "título SEO optimizado, máx 60 caracteres, incluye keyword principal",
  "seo_description": "meta description atractiva, 140-155 caracteres, incluye keyword y llamada a la acción",
  "seo_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug_suggestion": "url-amigable-en-minusculas-sin-tildes"
}`;

  const raw = await ask(prompt, 512);
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : raw) as SeoResult;
  } catch {
    return {
      seo_title: title.slice(0, 60),
      seo_description: plainText.slice(0, 155),
      seo_keywords: category,
      tags: [category],
      slug_suggestion: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
    };
  }
}

// ── ARTICLE REWRITER ─────────────────────────────────────────

export interface RewriteResult {
  title: string;
  content: string;
  excerpt: string;
}

export async function rewriteArticle(
  originalTitle: string,
  originalContent: string,
  sourceName: string,
): Promise<RewriteResult> {
  const plain = originalContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2000);
  const prompt = `Sos un periodista deportivo argentino profesional. Tu tarea es reescribir la siguiente nota en español rioplatense informal pero profesional, para el medio digital GolesNews.

NOTA ORIGINAL DE ${sourceName}:
Título: ${originalTitle}
Contenido: ${plain}

INSTRUCCIONES:
- Cambia completamente el título (más impactante y clickeable)
- Reescribí el contenido con tus propias palabras (mínimo 250 palabras)
- Mantené todos los datos factuales (fechas, nombres, resultados)
- Usá un tono dinámico, apasionado, argentino
- Agregá contexto cuando sea útil
- Estructurá con párrafos cortos (2-3 oraciones cada uno)

Respondé ÚNICAMENTE con JSON válido (sin markdown):
{
  "title": "nuevo título impactante",
  "excerpt": "resumen de 1 oración (máx 160 caracteres)",
  "content": "<p>párrafo 1...</p><p>párrafo 2...</p>"
}`;

  const raw = await ask(prompt, 1500);
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw) as RewriteResult;
    return parsed;
  } catch {
    return {
      title: `[Reescrito] ${originalTitle}`,
      excerpt: plain.slice(0, 160),
      content: `<p>${plain.replace(/\. /g, '.</p><p>')}</p>`,
    };
  }
}
