import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category: string;
  category_label: string;
  published_at?: string;
  author_name?: string;
  read_time?: number;
}

interface NewsCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'list';
}

export default function NewsCard({ article: a, variant = 'medium' }: NewsCardProps) {
  const date = a.published_at ? new Date(a.published_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '';

  if (variant === 'list') {
    return (
      <Link href={`/nota/${a.slug}`} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 9, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ height: 58, overflow: 'hidden', background: 'var(--bg3)', position: 'relative' }}>
          {a.featured_image ? (
            <Image src={a.featured_image} alt={a.title} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg4)' }} />
          )}
        </div>
        <div>
          <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 3 }}>
            {a.category_label}
          </span>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25, color: '#fff' }}>
            {a.title}
          </div>
        </div>
      </Link>
    );
  }

  const imgHeight = variant === 'large' ? 280 : 140;

  return (
    <Link href={`/nota/${a.slug}`} style={{ display: 'block', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all .15s', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ height: imgHeight, overflow: 'hidden', background: 'var(--bg3)', position: 'relative' }}>
        {a.featured_image ? (
          <Image src={a.featured_image} alt={a.title} fill style={{ objectFit: 'cover', transition: 'transform .4s' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--bg3),var(--bg4))' }} />
        )}
      </div>
      <div style={{ padding: '11px 12px' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: 5 }}>
          {a.category_label}
        </span>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: variant === 'large' ? 22 : 16, fontWeight: 700, lineHeight: 1.25, color: '#fff', marginBottom: 4 }}>
          {a.title}
        </div>
        {variant !== 'small' && a.excerpt && (
          <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.5 }}>
            {a.excerpt.slice(0, 120)}{a.excerpt.length > 120 ? '…' : ''}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text3)' }}>
          {date}{a.read_time ? ` · ${a.read_time} min` : ''}
        </div>
      </div>
    </Link>
  );
}
