import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, $cartCount, removeItem, updateQuantity, clearCart, initCart, restoreItem, restoreCart, type CartItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import styles from './QuoteItems.module.css';

/** Quote items list with quantity controls. Mount with client:load on /cotizacion. */
export default function QuoteItems() {
  const cart = useStore($cart);
  const totalCount = useStore($cartCount);

  useEffect(() => {
    initCart();
  }, []);

  // H3: Remove with Undo action
  const handleRemove = (sku: string, title: string, variant?: string) => {
    const removedItem = removeItem(sku, variant);
    if (removedItem) {
      const label = variant ? `${title} (${variant})` : title;
      showToast(`${label} eliminado`, 'info', {
        label: 'Deshacer',
        onClick: () => {
          restoreItem(removedItem);
          showToast(`${label} restaurado`, 'success');
        }
      });
    }
  };

  // H3: Confirm before clearing + Undo
  const handleClearAll = () => {
    const itemCount = cart.length;
    if (itemCount === 0) return;

    const confirmed = window.confirm(
      `¿Eliminar ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'} de la cotización?`
    );

    if (confirmed) {
      const previousItems = clearCart();
      showToast('Cotización vaciada', 'info', {
        label: 'Deshacer',
        onClick: () => {
          restoreCart(previousItems);
          showToast('Cotización restaurada', 'success');
        }
      });
    }
  };

  const handleQuantityChange = (sku: string, value: string, variant?: string) => {
    const qty = parseInt(value);
    if (!isNaN(qty) && qty >= 1) {
      updateQuantity(sku, qty, variant);
    }
  };

  // Empty state
  if (cart.length === 0) {
    return (
      <div class={styles['quote-empty']}>
        <div class={styles['quote-empty-icon']}>
          <svg viewBox="0 0 120 120" fill="none" width="80" height="80" aria-hidden="true">
            {/* Shopping bag body */}
            <rect x="25" y="40" width="70" height="60" rx="8" fill="url(#emptyGrad)" stroke="#0052CC" strokeWidth="2" opacity="0.9">
              <animate attributeName="y" values="40;38;40" dur="3s" repeatCount="indefinite" />
            </rect>
            {/* Bag handles */}
            <path d="M42 40V30a18 18 0 0136 0v10" stroke="#0052CC" strokeWidth="3" fill="none" strokeLinecap="round">
              <animate attributeName="d" values="M42 40V30a18 18 0 0136 0v10;M42 38V28a18 18 0 0136 0v8;M42 40V30a18 18 0 0136 0v10" dur="3s" repeatCount="indefinite" />
            </path>
            {/* Plus icon (bouncing) */}
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="3s" repeatCount="indefinite" />
              <circle cx="60" cy="70" r="14" fill="white" stroke="#0052CC" strokeWidth="2" />
              <line x1="60" y1="63" x2="60" y2="77" stroke="#E86100" strokeWidth="3" strokeLinecap="round">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </line>
              <line x1="53" y1="70" x2="67" y2="70" stroke="#E86100" strokeWidth="3" strokeLinecap="round">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </line>
            </g>
            {/* Sparkle decorations */}
            <circle cx="30" cy="35" r="2" fill="#0052CC" opacity="0.4">
              <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="32" r="1.5" fill="#E86100" opacity="0.3">
              <animate attributeName="opacity" values="0;0.5;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="85" cy="45" r="1" fill="#0052CC" opacity="0.3">
              <animate attributeName="opacity" values="0;0.4;0" dur="1.8s" begin="1s" repeatCount="indefinite" />
            </circle>
            <defs>
              <linearGradient id="emptyGrad" x1="25" y1="40" x2="95" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E8F0FE" />
                <stop offset="1" stopColor="#D2E3FC" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h3>Tu cotización está vacía</h3>
        <p>Agrega productos desde nuestro catálogo para solicitar una cotización personalizada</p>
        <a href="/productos" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style="margin-right: 6px"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          Ver Productos
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div class={styles['quote-items-header']}>
        <h3>Productos seleccionados ({cart.length})</h3>
        <button class={styles['clear-all-btn']} onClick={handleClearAll}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Vaciar todo
        </button>
      </div>

      {/* Items list */}
      <div class={styles['quote-items-list']}>
        {cart.map((item) => (
          <div key={`${item.sku}::${item.variant || ''}`} class={styles['quote-item']}>
            {/* Image */}
            <div class={styles['quote-item-image']}>
              {item.image ? (
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48" aria-hidden="true">
                  <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                  <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8" />
                  <path d="M50 75h20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div class={styles['quote-item-info']}>
              <div class={styles['quote-item-title']}>{item.title}</div>
              {item.variant && (
                <div class={styles['quote-item-variant']}>{item.variant}</div>
              )}
              <div class={styles['quote-item-meta']}>
                <span class={styles['quote-item-sku']}>SKU: {item.sku}</span>
                <span class={styles['quote-item-category']}>{item.category}</span>
              </div>
            </div>

            {/* Quantity controls */}
            <div class={styles['quote-item-quantity']}>
              <button
                class={styles['qty-btn']}
                onClick={() => updateQuantity(item.sku, Math.max(1, item.quantity - 1), item.variant)}
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
                onInput={(e) => handleQuantityChange(item.sku, (e.target as HTMLInputElement).value, item.variant)}
              />
              <button
                class={styles['qty-btn']}
                onClick={() => updateQuantity(item.sku, item.quantity + 1, item.variant)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            {/* Remove */}
            <button
              class={styles['remove-item-btn']}
              onClick={() => handleRemove(item.sku, item.title, item.variant)}
              aria-label={`Eliminar ${item.title}${item.variant ? ` (${item.variant})` : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
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
