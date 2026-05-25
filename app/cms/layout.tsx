import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'GolesNews CMS',
  robots: 'noindex,nofollow',
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d0d', color: '#e0e0e0' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', maxWidth: 'calc(100vw - 220px)' }}>
        {children}
      </main>
    </div>
  );
}
