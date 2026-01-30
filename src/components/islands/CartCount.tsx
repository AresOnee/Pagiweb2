import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';
import { $cartCount, initCart } from '../../stores/cart';

const badgeStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  padding: '0 4px',
  background: 'var(--color-accent)',
  color: 'var(--color-white)',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-bold)',
  borderRadius: 'var(--radius-full)',
  lineHeight: '1',
};

/** Cart count badge. Mount with client:load inside Header. */
export default function CartCount() {
  const count = useStore($cartCount);

  useEffect(() => {
    initCart();
  }, []);

  if (count === 0) return null;

  return <span style={badgeStyle}>{count}</span>;
}
