import { useStore } from '@nanostores/preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { $cartCount, initCart } from '../../stores/cart';

const badgeStyle: Record<string, string> = {
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
  transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

const bounceStyle: Record<string, string> = {
  ...badgeStyle,
  transform: 'scale(1.3)',
};

/** Cart count badge with bounce animation. Mount with client:load inside Header. */
export default function CartCount() {
  const count = useStore($cartCount);
  const [animate, setAnimate] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    initCart();
  }, []);

  // Bounce animation when count increases
  useEffect(() => {
    if (count > prevCount.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  if (count === 0) return null;

  return <span style={animate ? bounceStyle : badgeStyle}>{count}</span>;
}
