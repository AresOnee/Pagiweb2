import { useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, addItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import styles from './VariantSelector.module.css';

interface Props {
  sku: string;
  title: string;
  category: string;
  image: string | null;
  variants: Array<{ id: string; label: string; group?: string }>;
  onAdd?: () => void;
}

interface VariantState {
  selected: boolean;
  quantity: number;
}

/** Variant selector with checkboxes + individual quantities. Supports grouped variants. */
export default function VariantSelector({ sku, title, category, image, variants, onAdd }: Props) {
  const cart = useStore($cart);

  // Initialize state: all variants unselected with qty 1
  const [state, setState] = useState<Record<string, VariantState>>(() => {
    const initial: Record<string, VariantState> = {};
    for (const v of variants) {
      initial[v.id] = { selected: false, quantity: 1 };
    }
    return initial;
  });

  const selectedCount = Object.values(state).filter((s) => s.selected).length;

  const toggleVariant = (id: string) => {
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }));
  };

  const setQuantity = (id: string, qty: number) => {
    const q = Math.max(1, Math.min(99, qty));
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantity: q, selected: true },
    }));
  };

  const handleAdd = () => {
    const toAdd = variants.filter((v) => state[v.id].selected);
    if (toAdd.length === 0) return;

    for (const v of toAdd) {
      addItem({
        sku,
        title,
        category,
        quantity: state[v.id].quantity,
        image,
        variant: v.group ? `${v.group} — ${v.label}` : v.label,
      });
    }

    const msg = toAdd.length === 1
      ? `${toAdd[0].label} agregado a la cotización`
      : `${toAdd.length} variantes de ${title} agregadas a la cotización`;
    showToast(msg, 'success');

    // Reset selections
    setState((prev) => {
      const reset: Record<string, VariantState> = {};
      for (const key of Object.keys(prev)) {
        reset[key] = { selected: false, quantity: 1 };
      }
      return reset;
    });

    onAdd?.();
  };

  // Get count of this variant already in cart
  const getCartQty = (v: { label: string; group?: string }): number => {
    const variantLabel = v.group ? `${v.group} — ${v.label}` : v.label;
    const item = cart.find((i) => i.sku === sku && i.variant === variantLabel);
    return item ? item.quantity : 0;
  };

  // Check if variants use groups
  const hasGroups = variants.some((v) => v.group);

  // Extract unique subtype names for chips display
  const subtypes = hasGroups
    ? [...new Set(variants.map((v) => {
        const g = v.group || '';
        const dashIdx = g.indexOf(' \u2014 ');
        return dashIdx > -1 ? g.substring(0, dashIdx) : g;
      }))]
    : [];

  // Build grouped structure preserving insertion order
  const grouped = hasGroups
    ? variants.reduce<Array<{ group: string; items: typeof variants }>>((acc, v) => {
        const g = v.group || '';
        const existing = acc.find((entry) => entry.group === g);
        if (existing) {
          existing.items.push(v);
        } else {
          acc.push({ group: g, items: [v] });
        }
        return acc;
      }, [])
    : null;

  const renderVariantRow = (v: (typeof variants)[0]) => {
    const s = state[v.id];
    const cartQty = getCartQty(v);
    return (
      <label key={v.id} class={`${styles.row} ${s.selected ? styles.selected : ''}`}>
        <input
          type="checkbox"
          class={styles.checkbox}
          checked={s.selected}
          onChange={() => toggleVariant(v.id)}
        />
        <span class={styles.label}>
          {v.label}
          {cartQty > 0 && (
            <span class={styles.inCart}> (en cotización: {cartQty})</span>
          )}
        </span>
        <div class={styles.qtyControls}>
          <button
            type="button"
            class={styles.qtyBtn}
            onClick={(e) => { e.preventDefault(); setQuantity(v.id, s.quantity - 1); }}
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <input
            type="number"
            class={styles.qtyInput}
            min="1"
            max="99"
            value={s.quantity}
            onInput={(e) => {
              const val = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(val)) setQuantity(v.id, val);
            }}
          />
          <button
            type="button"
            class={styles.qtyBtn}
            onClick={(e) => { e.preventDefault(); setQuantity(v.id, s.quantity + 1); }}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </label>
    );
  };

  return (
    <div class={styles.container}>
      {/* Panel header */}
      <div class={styles.panelHeader}>
        <svg class={styles.panelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <span class={styles.panelTitle}>Configurar Variante</span>
        <span class={styles.selectionCount}>
          {selectedCount > 0
            ? `${selectedCount} de ${variants.length} seleccionadas`
            : `${variants.length} disponibles`}
        </span>
      </div>

      {/* Subtype chips (only for grouped variants) */}
      {hasGroups && subtypes.length > 0 && (
        <div class={styles.subtypeInfo}>
          <span class={styles.subtypeLabel}>Subtipos:</span>
          <div class={styles.subtypeChips}>
            {subtypes.map((name) => (
              <span key={name} class={styles.subtypeChip}>{name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Variant list */}
      <div class={styles.listBody}>
        <div class={styles.list}>
          {grouped
            ? grouped.map(({ group, items }) => (
                <div key={group}>
                  <div class={styles.groupHeader}>{group}</div>
                  {items.map(renderVariantRow)}
                </div>
              ))
            : variants.map(renderVariantRow)
          }
        </div>
      </div>

      {/* Panel footer with add button */}
      <div class={styles.panelFooter}>
        <button
          type="button"
          class={styles.addBtn}
          onClick={handleAdd}
          disabled={selectedCount === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {selectedCount === 0
            ? 'Selecciona al menos una variante'
            : selectedCount === 1
              ? 'Agregar 1 variante a Cotización'
              : `Agregar ${selectedCount} variantes a Cotización`}
        </button>
      </div>
    </div>
  );
}
