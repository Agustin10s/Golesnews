'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/cms/dashboard',    label: 'Dashboard',    icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { href: '/cms/articles',     label: 'Artículos',    icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )},
  { href: '/cms/articles/new', label: 'Nueva nota',   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
  )},
  { href: '/cms/categories',   label: 'Categorías',   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
  )},
  { href: '/cms/media',        label: 'Archivos',     icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
  )},
  { href: '/cms/ads',          label: 'Publicidad',   icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/><path d="M7 12h10M7 8h10M7 16h6"/></svg>
  )},
  { href: '/cms/analytics',    label: 'Analytics',    icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
  )},
  { href: '/cms/autopublish',  label: 'Auto IA',      icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  )},
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
      width: 220, minHeight: '100vh', background: '#060606',
      borderRight: '1px solid #141414', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid #141414' }}>
        <Link href="/cms/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -.5 }}>
            GOLES<span style={{ color: '#e8353a' }}>NEWS</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#333', marginTop: 3 }}>Content Management</div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(n => {
          const active = pathname === n.href || (n.href !== '/cms/dashboard' && n.href !== '/cms/articles/new' && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', marginBottom: 1,
              borderRadius: 5, textDecoration: 'none',
              background: active ? 'rgba(232,53,58,.12)' : 'transparent',
              color: active ? '#e8353a' : '#555',
              fontSize: 12, fontWeight: active ? 600 : 400,
              transition: 'all .12s',
              borderLeft: active ? '2px solid #e8353a' : '2px solid transparent',
            }}>
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid #141414' }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 5, textDecoration: 'none',
          color: '#333', fontSize: 12, transition: 'color .12s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          Ver sitio
        </Link>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '8px 10px', borderRadius: 5, background: 'none', border: 'none',
          color: '#333', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'color .12s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
