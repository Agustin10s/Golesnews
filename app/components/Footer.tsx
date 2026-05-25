import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#000', borderTop: '1px solid var(--border)', padding: '36px 0 22px', marginTop: 36 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '1.8rem' }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 7 }}>
              Goles<span style={{ color: 'var(--red)' }}>News</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text3)', lineHeight: 1.65, maxWidth: 240 }}>
              Portal de fútbol argentino y europeo. Datos reales desde APIs oficiales. Actualización automática.
            </div>
          </div>
          <div>
            <h5 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 11 }}>Argentina</h5>
            <Link href="/liga-argentina" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Liga Profesional</Link>
            <Link href="/liga-argentina#copa" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Copa Argentina</Link>
            <Link href="/liga-argentina#libertadores" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Libertadores</Link>
            <Link href="/liga-argentina#sudamericana" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Sudamericana</Link>
          </div>
          <div>
            <h5 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 11 }}>Europa</h5>
            <Link href="/europa#premier" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Premier League</Link>
            <Link href="/europa#laliga" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>La Liga</Link>
            <Link href="/europa#champions" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Champions League</Link>
            <Link href="/europa#seriea" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Serie A</Link>
          </div>
          <div>
            <h5 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 11 }}>GolesNews</h5>
            <Link href="/mundial-2026" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Mundial 2026</Link>
            <Link href="/fixture" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Fixture</Link>
            <Link href="/tablas" style={{ display: 'block', fontSize: 12.5, color: 'var(--text2)', marginBottom: 7, textDecoration: 'none' }}>Tablas</Link>
            <Link href="/en-vivo" style={{ display: 'block', fontSize: 12.5, color: 'var(--red)', marginBottom: 7, textDecoration: 'none', fontWeight: 600 }}>● En Vivo</Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 10.5, color: 'var(--text3)' }}>© 2026 GolesNews.com — Todos los derechos reservados</p>
          <p style={{ fontSize: 10.5, color: 'var(--text3)' }}>Powered by API-Football · Liga Profesional · Premier League · LaLiga · Mundial 2026</p>
        </div>
      </div>
    </footer>
  );
}
