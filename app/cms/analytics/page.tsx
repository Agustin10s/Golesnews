'use client';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface AnalyticsData {
  totalViews: number;
  viewsByDay: { d: string; c: number }[];
  topPages: { path: string; c: number }[];
  topArticles: { id: number; title: string; slug: string; category: string; views: number }[];
  viewsByCategory: { category: string; total: number }[];
  articles: { total: number; published: number; drafts: number };
}

const COLORS = ['#e8353a', '#3b82f6', '#10b981', '#d4af37', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444'];

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '20px 24px', borderRadius: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 40, fontWeight: 800, color: accent ?? '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cms/analytics?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d as AnalyticsData); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  const maxDayViews = data ? Math.max(...data.viewsByDay.map(v => v.c), 1) : 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0' }}>Métricas de audiencia y rendimiento</p>
        </div>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          style={{ background: '#111', border: '1px solid #222', color: '#e0e0e0', padding: '8px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 4, outline: 'none' }}>
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#444', fontSize: 14 }}>
          Cargando métricas...
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>Sin datos disponibles</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="Vistas totales" value={data.totalViews.toLocaleString()} sub={`Últimos ${days} días`} accent="#e8353a" />
            <StatCard label="Artículos publicados" value={data.articles.published} sub={`${data.articles.total} totales`} />
            <StatCard label="Borradores" value={data.articles.drafts} />
            <StatCard label="Art. más visto" value={data.topArticles[0]?.views ?? 0} sub={data.topArticles[0] ? data.topArticles[0].title.slice(0, 30) + '...' : '-'} accent="#d4af37" />
          </div>

          {/* Views chart */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '20px 20px 12px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: .5, textTransform: 'uppercase', marginBottom: 16 }}>Vistas por día</div>
            {data.viewsByDay.length === 0 ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>
                Sin datos de vistas. Las vistas se registran cuando los lectores abren artículos.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.viewsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8353a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e8353a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#444' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#444' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 4, fontSize: 12 }}
                    labelStyle={{ color: '#888' }}
                    itemStyle={{ color: '#e8353a' }}
                  />
                  <Area type="monotone" dataKey="c" name="Vistas" stroke="#e8353a" fill="url(#vg)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Top articles */}
            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#555' }}>Artículos más leídos</span>
              </div>
              {data.topArticles.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#444', fontSize: 13 }}>Sin datos</div>
              ) : data.topArticles.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid #111' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#444', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{a.category}</div>
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: '#e8353a', flexShrink: 0 }}>{a.views.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Views by category */}
            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#555', marginBottom: 16 }}>Vistas por categoría</div>
              {data.viewsByCategory.length === 0 ? (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.viewsByCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#444' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#444' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 4, fontSize: 12 }}
                      labelStyle={{ color: '#888' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="total" name="Vistas" radius={[3, 3, 0, 0]}>
                      {data.viewsByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top pages */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#555' }}>Páginas más visitadas</span>
            </div>
            {data.topPages.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#444', fontSize: 13 }}>Sin datos de tráfico registrados</div>
            ) : data.topPages.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #111' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#444', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>{p.path}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, width: 80, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#e8353a', borderRadius: 2, width: `${Math.round((p.c / (data.topPages[0]?.c ?? 1)) * 100)}%` }} />
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, color: '#e8353a', width: 50, textAlign: 'right' }}>{p.c.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
