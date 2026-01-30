import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, $cartCount, removeItem, updateQuantity, clearCart, initCart } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import styles from './QuoteItems.module.css';

/** Quote items list with quantity controls. Mount with client:load on /cotizacion. */
export default function QuoteItems() {
  const cart = useStore($cart);
  const totalCount = useStore($cartCount);

  useEffect(() => {
    initCart();
  }, []);

  const handleRemove = (sku: string, title: string) => {
    removeItem(sku);
    showToast(`${title} eliminado de la cotización`, 'info');
  };

  const handleClearAll = () => {
    clearCart();
    showToast('Cotización vaciada', 'info');
  };

  const handleQuantityChange = (sku: string, value: string) => {
    const qty = parseInt(value);
    if (!isNaN(qty) && qty >= 1) {
      updateQuantity(sku, qty);
    }
  };

  // Empty state
  if (cart.length === 0) {
    return (
      <div class={styles['quote-empty']}>
        <div class={styles['quote-empty-icon']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h3>Tu cotización está vacía</h3>
        <p>Agrega productos desde nuestro catálogo para solicitar una cotización</p>
        <a href="/productos" class="btn btn-primary">Ver Productos</a>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div class={styles['quote-items-header']}>
        <h3>Productos seleccionados ({cart.length})</h3>
        <button class={styles['clear-all-btn']} onClick={handleClearAll}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Vaciar todo
        </button>
      </div>

      {/* Items list */}
      <div class={styles['quote-items-list']}>
        {cart.map((item) => (
          <div key={item.sku} class={styles['quote-item']}>
            {/* Image */}
            <div class={styles['quote-item-image']}>
              {item.image ? (
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
                  <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                  <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8" />
                  <path d="M50 75h20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div class={styles['quote-item-info']}>
              <div class={styles['quote-item-title']}>{item.title}</div>
              <div class={styles['quote-item-meta']}>
                <span class={styles['quote-item-sku']}>SKU: {item.sku}</span>
                <span class={styles['quote-item-category']}>{item.category}</span>
              </div>
            </div>

            {/* Quantity controls */}
            <div class={styles['quote-item-quantity']}>
              <button
                class={styles['qty-btn']}
                onClick={() => updateQuantity(item.sku, Math.max(1, item.quantity - 1))}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <input
                class={styles['qty-input']}
                type="number"
                min="1"
                max="99"
                value={item.quantity}
                onInput={(e) => handleQuantityChange(item.sku, (e.target as HTMLInputElement).value)}
              />
              <button
                class={styles['qty-btn']}
                onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            {/* Remove */}
            <button
              class={styles['remove-item-btn']}
              onClick={() => handleRemove(item.sku, item.title)}
              aria-label={`Eliminar ${item.title}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div class={styles['quote-items-footer']}>
        <span>Total de productos: <strong>{totalCount} {totalCount === 1 ? 'unidad' : 'unidades'}</strong></span>
      </div>
    </div>
  );
}
