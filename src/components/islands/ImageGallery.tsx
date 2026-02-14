import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import styles from './ImageGallery.module.css';

interface Props {
  images: string[];
  alt: string;
  badge?: string | null;
}

export default function ImageGallery({ images, alt, badge }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef(0);
  const prevOverflow = useRef('');
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const hasMultiple = images.length > 1;

  // --- Hover zoom (throttled with rAF) ---
  const rafRef = useRef(0);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      if (!mainImageRef.current || !imgRef.current) return;
      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      imgRef.current.style.transformOrigin = `${x}% ${y}%`;
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZooming(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
    if (imgRef.current) imgRef.current.style.transformOrigin = 'center center';
  }, []);

  // --- Lightbox open/close ---
  const openLightbox = useCallback(() => {
    setLightboxIndex(activeIndex);
    setLightboxOpen(true);
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }, [activeIndex]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = prevOverflow.current;
  }, []);

  // --- Lightbox navigation ---
  const goLightbox = useCallback((dir: -1 | 1) => {
    setLightboxIndex(prev => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }, [images.length]);

  // --- Lightbox keyboard (capture phase) ---
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.stopImmediatePropagation();
        e.preventDefault();
        goLightbox(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.stopImmediatePropagation();
        e.preventDefault();
        goLightbox(1);
        return;
      }
      if (e.key === 'Tab') {
        e.stopImmediatePropagation();
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler, { capture: true });
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, [lightboxOpen, closeLightbox, goLightbox]);

  // --- Lightbox touch swipe ---
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      goLightbox(deltaX > 0 ? -1 : 1);
    }
  }, [goLightbox]);

  // --- Render ---
  if (images.length === 0) return null;

  const lightboxPortal = lightboxOpen
    ? createPortal(
        <div
          class={styles.lightbox}
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains(styles.lightbox) ||
                (e.target as HTMLElement).classList.contains(styles['lightbox-overlay'])) {
              closeLightbox();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — imagen ${lightboxIndex + 1} de ${images.length}`}
        >
          <div class={styles['lightbox-overlay']} />

          <button
            ref={closeBtnRef}
            class={styles['lightbox-close']}
            onClick={closeLightbox}
            aria-label="Cerrar visor"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div class={styles['lightbox-counter']}>
            {lightboxIndex + 1} / {images.length}
          </div>

          {hasMultiple && (
            <button
              class={`${styles['lightbox-arrow']} ${styles['lightbox-prev']}`}
              onClick={() => goLightbox(-1)}
              aria-label="Imagen anterior"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div
            class={styles['lightbox-image-wrap']}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${alt} — imagen ${lightboxIndex + 1}`}
              class={styles['lightbox-image']}
              decoding="async"
            />
          </div>

          {hasMultiple && (
            <button
              class={`${styles['lightbox-arrow']} ${styles['lightbox-next']}`}
              onClick={() => goLightbox(1)}
              aria-label="Imagen siguiente"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div class={styles.gallery}>
      {badge && <span class={styles['gallery-badge']}>{badge}</span>}

      {/* Main image with zoom */}
      <div
        ref={mainImageRef}
        class={`${styles['gallery-main']} ${isZooming ? styles.zooming : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label={`Ver ${alt} en pantalla completa`}
        onKeyDown={(e) => { if (e.key === 'Enter') openLightbox(); }}
      >
        <img
          ref={imgRef}
          src={images[activeIndex]}
          alt={alt}
          class={styles['gallery-main-img']}
          width="800"
          height="800"
          decoding="async"
        />
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div class={styles['gallery-thumbs']} role="group" aria-label="Miniaturas del producto">
          {images.map((src, i) => (
            <button
              key={src}
              class={`${styles['gallery-thumb']} ${i === activeIndex ? styles.active : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {lightboxPortal}
    </div>
  );
}
