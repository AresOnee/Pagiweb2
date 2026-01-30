import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $selectedProduct, closeProductModal } from '../../stores/ui';
import { $cart, addItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import styles from './ProductModal.module.css';

/** Product detail modal with tabs, quantity controls, add-to-cart. Mount with client:load. */
export default function ProductModal() {
  const product = useStore($selectedProduct);
  const cart = useStore($cart);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'features'>('specs');

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    setActiveTab('specs');
  }, [product?.sku]);

  // Body scroll lock
  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  // Escape key to close
  useEffect(() => {
    if (!product) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProductModal();
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [product]);

  if (!product) return null;

  const existing = cart.find((item) => item.sku === product.sku);
  const isInCart = !!existing;

  const handleAdd = () => {
    addItem({
      sku: product.sku,
      title: product.title,
      category: product.category,
      quantity,
      image: product.image,
    });
    showToast(
      isInCart
        ? `${product.title} actualizado en la cotización`
        : `${product.title} agregado a la cotización`,
      'success'
    );
    closeProductModal();
  };

  const handleOverlayClick = (e: Event) => {
    if ((e.target as HTMLElement).classList.contains(styles['product-modal-overlay'])) {
      closeProductModal();
    }
  };

  const specsEntries = Object.entries(product.specs);

  return (
    <div class={`${styles['product-modal']} ${styles.active}`} onClick={handleOverlayClick}>
      <div class={styles['product-modal-overlay']} />
      <div class={styles['product-modal-content']}>
        {/* Close button */}
        <button class={styles['product-modal-close']} onClick={closeProductModal} aria-label="Cerrar modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class={styles['product-modal-body']}>
          {/* Two-column grid */}
          <div class={styles['product-modal-grid']}>
            {/* Left: Image */}
            <div class={styles['product-modal-image']}>
              {product.badge && (
                <span class={styles['product-badge']}>{product.badge}</span>
              )}
              <div class={styles['product-modal-image-main']}>
                {product.image ? (
                  <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
                    <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                    <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8" />
                    <path d="M50 75h20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
                  </svg>
                )}
              </div>
              {/* Stock indicator */}
              <div class={`${styles['product-modal-stock']} ${!product.inStock ? styles['out-stock'] : ''}`}>
                <span class={styles['stock-dot']} />
                {product.inStock ? 'En Stock' : 'Sin Stock'}
              </div>
            </div>

            {/* Right: Info */}
            <div class={styles['product-modal-info']}>
              <span class={styles['product-category']}>{product.category}</span>
              <h2 class={styles['product-modal-title']}>{product.title}</h2>
              <p class={styles['product-modal-sku']}>SKU: {product.sku}</p>
              <p class={styles['product-modal-description']}>{product.description}</p>

              {/* Actions */}
              <div class={styles['product-modal-actions']}>
                {/* Quantity selector */}
                <div class={styles['quantity-selector']}>
                  <label>Cantidad:</label>
                  <div class={styles['quantity-controls']}>
                    <button
                      class={styles['qty-btn']}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
                    <input
                      class={styles['qty-input']}
                      type="number"
                      min="1"
                      max="99"
                      value={quantity}
                      onInput={(e) => {
                        const val = parseInt((e.target as HTMLInputElement).value);
                        if (!isNaN(val) && val >= 1 && val <= 99) setQuantity(val);
                      }}
                    />
                    <button
                      class={styles['qty-btn']}
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add button */}
                <button class={styles['btn-add-modal']} onClick={handleAdd}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {isInCart ? 'Actualizar Cotización' : 'Agregar a Cotización'}
                </button>

                {isInCart && (
                  <a href="/cotizacion" class={styles['product-card-clickable']} style={{ textAlign: 'center', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>
                    Ver Cotización →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div class={styles['product-modal-tabs']}>
            <button
              class={`${styles['tab-btn']} ${activeTab === 'specs' ? styles.active : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Especificaciones Técnicas
            </button>
            <button
              class={`${styles['tab-btn']} ${activeTab === 'features' ? styles.active : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Características
            </button>
          </div>

          {/* Tab content */}
          <div class={styles['product-modal-tab-content']}>
            {/* Specs tab */}
            {activeTab === 'specs' && (
              <div class={styles['specs-grid']}>
                {specsEntries.map(([label, value]) => (
                  <div key={label} class={styles['spec-item']}>
                    <span class={styles['spec-label']}>{label}</span>
                    <span class={styles['spec-value']}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Features tab */}
            {activeTab === 'features' && (
              <ul class={styles['features-list']}>
                {product.features.map((feature, i) => (
                  <li key={i}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
