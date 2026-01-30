import { useStore } from '@nanostores/preact';
import { $cart, addItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';

interface Props {
  sku: string;
  title: string;
  category: string;
  image: string | null;
}

const btnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-2)',
  padding: 'var(--spacing-2) var(--spacing-4)',
  background: 'var(--color-accent)',
  color: 'var(--color-white)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 300ms ease',
};

const btnAddedStyle = {
  ...btnStyle,
  background: 'var(--color-success)',
};

/** Add-to-quote button. Mount with client:visible on ProductCard. */
export default function AddToQuoteBtn({ sku, title, category, image }: Props) {
  const cart = useStore($cart);
  const existing = cart.find((item) => item.sku === sku);

  const handleClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    addItem({ sku, title, category, quantity: 1, image });
    showToast(`${title} agregado a la cotización`, 'success');
  };

  return (
    <button
      style={existing ? btnAddedStyle : btnStyle}
      onClick={handleClick}
      aria-label={existing ? `${title} en cotización` : `Agregar ${title} a cotización`}
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
