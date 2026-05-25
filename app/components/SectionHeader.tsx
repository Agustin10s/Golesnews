interface SectionHeaderProps {
  title: string;
  badge?: string;
  action?: { label: string; href: string };
}

export default function SectionHeader({ title, badge, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 9, borderBottom: '2px solid var(--border2)' }}>
      <span style={{ width: 4, height: 18, background: 'var(--red)', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: '#fff' }}>
        {title}
      </span>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 7px', background: 'var(--red)', color: '#fff' }}>
          {badge}
        </span>
      )}
      {action && (
        <a href={action.href} style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text3)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.5px', textDecoration: 'none' }}>
          {action.label} →
        </a>
      )}
    </div>
  );
}
