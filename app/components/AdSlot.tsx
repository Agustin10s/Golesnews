'use client';
import { useEffect, useState, useRef } from 'react';

interface Ad {
  id: number; name: string; placement: string; type: string;
  content: string; link_url: string;
}

interface Props {
  placement: string;
  style?: React.CSSProperties;
}

export default function AdSlot({ placement, style }: Props) {
  const [ad, setAd] = useState<Ad | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    fetch(`/api/cms/ads?placement=${placement}&active=1`)
      .then(r => r.json())
      .then((d: { ads?: Ad[] }) => {
        const ads = d.ads ?? [];
        if (ads.length > 0) {
          // Pick a random active ad for the placement
          setAd(ads[Math.floor(Math.random() * ads.length)]);
        }
      }).catch(() => {});
  }, [placement]);

  useEffect(() => {
    if (ad && !tracked.current) {
      tracked.current = true;
      fetch('/api/cms/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, action: 'impression' }),
      }).catch(() => {});
    }
  }, [ad]);

  if (!ad) return null;

  function handleClick() {
    if (!ad) return;
    fetch('/api/cms/ads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ad.id, action: 'click' }),
    }).catch(() => {});
  }

  if (ad.type === 'code' || ad.type === 'adsense') {
    return (
      <div style={{ textAlign: 'center', ...style }} dangerouslySetInnerHTML={{ __html: ad.content }} />
    );
  }

  // Image ad
  return (
    <div style={{ textAlign: 'center', ...style }}>
      {ad.link_url ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.content} alt={ad.name} style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }} />
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.content} alt={ad.name} style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }} />
      )}
    </div>
  );
}

// ── Popup Ad ────────────────────────────────────────────────
export function PopupAd() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show popup once per session
    if (sessionStorage.getItem('popup_shown')) return;
    fetch('/api/cms/ads?placement=popup&active=1')
      .then(r => r.json())
      .then((d: { ads?: Ad[] }) => {
        const ads = d.ads ?? [];
        if (ads.length > 0) {
          const chosen = ads[Math.floor(Math.random() * ads.length)];
          setAd(chosen);
          // Show after 3 seconds
          setTimeout(() => { setOpen(true); sessionStorage.setItem('popup_shown', '1'); }, 3000);
          // Track impression
          fetch('/api/cms/ads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: chosen.id, action: 'impression' }),
          }).catch(() => {});
        }
      }).catch(() => {});
  }, []);

  if (!ad || !open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div style={{ position: 'relative', maxWidth: 600, width: '100%' }}>
        <button onClick={() => setOpen(false)} style={{
          position: 'absolute', top: -12, right: -12, width: 28, height: 28, borderRadius: '50%',
          background: '#1a1a1a', border: '1px solid #333', color: '#aaa', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
        }}>×</button>
        {ad.type === 'code' || ad.type === 'adsense' ? (
          <div dangerouslySetInnerHTML={{ __html: ad.content }} />
        ) : ad.link_url ? (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer" onClick={() => {
            fetch('/api/cms/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ad.id, action: 'click' }) }).catch(() => {});
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.content} alt={ad.name} style={{ width: '100%', borderRadius: 4 }} />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.content} alt={ad.name} style={{ width: '100%', borderRadius: 4 }} />
        )}
      </div>
    </div>
  );
}

// ── Sticky Bottom Ad ────────────────────────────────────────
export function StickyBottomAd() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/cms/ads?placement=sticky-bottom&active=1')
      .then(r => r.json())
      .then((d: { ads?: Ad[] }) => {
        const ads = d.ads ?? [];
        if (ads.length > 0) setAd(ads[Math.floor(Math.random() * ads.length)]);
      }).catch(() => {});
  }, []);

  if (!ad || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 800,
      background: '#000', borderTop: '1px solid #1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6px 16px', gap: 12,
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {ad.type === 'code' || ad.type === 'adsense' ? (
          <div dangerouslySetInnerHTML={{ __html: ad.content }} />
        ) : ad.link_url ? (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.content} alt={ad.name} style={{ maxHeight: 60, objectFit: 'contain' }} />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.content} alt={ad.name} style={{ maxHeight: 60, objectFit: 'contain' }} />
        )}
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer', flexShrink: 0, padding: '4px 8px' }}>×</button>
    </div>
  );
}
