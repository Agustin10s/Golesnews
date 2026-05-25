'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/cms/dashboard',    icon: '📊', label: 'Dashboard' },
  { href: '/cms/articles',     icon: '📝', label: 'Artículos' },
  { href: '/cms/articles/new', icon: '✏️',  label: 'Nueva nota' },
  { href: '/cms/media',        icon: '🖼️',  label: 'Archivos' },
  { href: '/cms/autopublish',  icon: '🤖', label: 'Auto IA' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/cms/auth/logout', { method: 'POST' });
    router.push('/cms/login');
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#0a0a0a',
      borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1a1a1a' }}>
        <Link href="/cms/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff' }}>
            Goles<span style={{ color: '#e8353a' }}>News</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginTop: 2 }}>CMS Panel</div>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map(n => {
          const active = pathname === n.href || (n.href !== '/cms/dashboard' && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', marginBottom: 2,
              borderRadius: 6, textDecoration: 'none',
              background: active ? 'rgba(232,53,58,.15)' : 'transparent',
              color: active ? '#e8353a' : '#aaa',
              fontSize: 13, fontWeight: active ? 600 : 400,
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid #1a1a1a' }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 6, textDecoration: 'none',
          color: '#555', fontSize: 12,
        }}>
          🌐 Ver sitio
        </Link>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '9px 12px', borderRadius: 6, background: 'none', border: 'none',
          color: '#555', fontSize: 12, cursor: 'pointer', textAlign: 'left',
        }}>
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
