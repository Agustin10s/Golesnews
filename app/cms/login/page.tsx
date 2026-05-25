'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/cms/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (data.ok) {
      router.push('/cms/dashboard');
    } else {
      setError(data.error || 'Error de autenticación');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 40, fontWeight: 800, color: '#fff' }}>
            Goles<span style={{ color: '#e8353a' }}>News</span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginTop: 4 }}>Panel CMS</div>
        </div>

        <form onSubmit={login} style={{ background: '#111', border: '1px solid #1e1e1e', padding: '28px 24px', borderRadius: 10 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#777', marginBottom: 6 }}>Usuario</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              autoComplete="username" required
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '10px 12px', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              placeholder="admin"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#777', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" required
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '10px 12px', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(232,53,58,.1)', border: '1px solid rgba(232,53,58,.3)', color: '#e8353a', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#555' : '#e8353a', color: '#fff', border: 'none', padding: '12px', borderRadius: 6, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#444', marginTop: 16 }}>
          Usuario por defecto: admin / golesnews2026
        </p>
      </div>
    </div>
  );
}
