import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $recentlyViewed, initRecentlyViewed } from '../../stores/recentlyViewed';
import type { ViewedItem } from '../../stores/recentlyViewed';

interface Props {
  currentSku: string;
}

export default function RecentlyViewed({ currentSku }: Props) {
  const viewed = useStore($recentlyViewed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initRecentlyViewed();
    setReady(true);
  }, []);

  if (!ready) return null;

  const items = viewed.filter((v: ViewedItem) => v.sku !== currentSku).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <div class="recently-viewed-section" data-aos="fade-up">
      <h2 class="recently-viewed-title">Vistos Recientemente</h2>
      <div class="recently-viewed-grid">
        {items.map((item: ViewedItem) => (
          <a key={item.sku} href={`/productos/${item.slug}`} class="recently-viewed-card">
            <div class="rv-image">
              {item.image ? (
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" width="120" height="80" />
              ) : (
                <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48" aria-hidden="true">
                  <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                  <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8" />
                  <path d="M50 75h20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span class="rv-title">{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
