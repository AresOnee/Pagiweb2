import { useStore } from '@nanostores/preact';
import { $cart, addItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';

interface Props {
  sku: string;
  title: string;
  category: string;
  image: string | null;
  inStock?: boolean;
}

/** Add-to-quote button. Mount with client:visible on ProductCard. */
export default function AddToQuoteBtn({ sku, title, category, image, inStock = true }: Props) {
  const cart = useStore($cart);
  const existing = cart.find((item) => item.sku === sku);

  const handleClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    if (!inStock) return;
    addItem({ sku, title, category, quantity: 1, image });
    showToast(`${title} agregado a la cotización`, 'success');
  };

  if (!inStock) {
    return (
      <button
        class="btn-add-quote no-stock"
        disabled
        aria-label={`${title} sin stock`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        Sin Stock
      </button>
    );
  }

  return (
    <button
      class={`btn-add-quote ${existing ? 'added' : ''}`}
      onClick={handleClick}
      aria-label={existing ? `Agregado ${title} (${existing.quantity})` : `Cotizar ${title}`}
    >
      {existing ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Agregado ({existing.quantity})
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Cotizar
        </>
      )}
    </button>
  );
}
