import { useState } from 'preact/hooks';
import ImageGallery from './ImageGallery';
import VariantSelector from './VariantSelector';
import styles from './MoldTypeTabs.module.css';

interface MoldType {
  code: string;
  name: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  image: string | null;
  images?: string[];
  variants?: Array<{ id: string; label: string; group?: string }>;
}

interface Props {
  sku: string;
  title: string;
  category: string;
  moldTypes: MoldType[];
}

export default function MoldTypeTabs({ sku, title, category, moldTypes }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = moldTypes[activeIdx];

  if (!active) return null;

  const allImages = [
    ...(active.image ? [active.image] : []),
    ...(active.images || []),
  ];
  const specsEntries = Object.entries(active.specs);
  const hasVariants = active.variants && active.variants.length > 0;

  return (
    <div class={styles.container}>
      {/* Tab bar */}
      {moldTypes.length > 1 && (
        <div class={styles.tabBar} role="tablist">
          {moldTypes.map((mt, i) => (
            <button
              key={mt.code}
              type="button"
              class={i === activeIdx ? styles.tabActive : styles.tab}
              role="tab"
              aria-selected={i === activeIdx}
              onClick={() => setActiveIdx(i)}
            >
              {mt.code}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div class={styles.content}>
        {/* Image column */}
        <div class={styles.imageCol}>
          {allImages.length > 0 ? (
            <ImageGallery images={allImages} alt={`${title} — ${active.code}`} />
          ) : (
            <div class={styles.imagePlaceholder}>
              <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
                <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8" />
                <path d="M50 75h20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Info column */}
        <div class={styles.infoCol}>
          <div class={styles.typeCode}>Código {active.code}</div>
          <h2 class={styles.typeName}>{active.name}</h2>
          <p class={styles.typeDesc}>{active.description}</p>

          {/* Specs */}
          {specsEntries.length > 0 && (
            <div class={styles.specsSection}>
              <h3 class={styles.specsTitle}>Especificaciones</h3>
              <div class={styles.specsTable}>
                {specsEntries.map(([label, value]) => (
                  <div key={label} class={styles.specRow}>
                    <span class={styles.specLabel}>{label}</span>
                    <span class={styles.specValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {active.features.length > 0 && (
            <div class={styles.featuresSection}>
              <h3 class={styles.featuresTitle}>Características</h3>
              <ul class={styles.featuresList}>
                {active.features.map((feat, i) => (
                  <li key={i} class={styles.featureItem}>
                    <svg class={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variant selector */}
          {hasVariants && (
            <div class={styles.variantArea}>
              <VariantSelector
                key={active.code}
                sku={sku}
                title={`${title} — ${active.code}`}
                category={category}
                image={active.image}
                variants={active.variants!}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
