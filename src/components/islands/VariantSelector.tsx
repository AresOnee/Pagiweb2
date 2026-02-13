import { useState, useMemo } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, addItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import styles from './VariantSelector.module.css';

/* ---- Types ---- */

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

type ConfigMode = 'flat' | 'three-step' | 'two-step-bar' | 'two-step-model';

interface VariantItem { id: string; label: string; group: string; }
interface BarData { size: string; cables: VariantItem[]; }
interface ModelData { code: string; bars?: BarData[]; cables?: VariantItem[]; }

/* ---- Constants ---- */

const GAUGE_DOT: Record<string, number> = {
  'Cable N°6': 6,  'Cable N°4': 8,  'Cable N°3': 9,  'Cable N°2': 10,
  'Cable N°1': 12, 'Cable N°1/0': 14, 'Cable N°2/0': 16,
  'Cable N°3/0': 18, 'Cable N°4/0': 20,
  'Cable 250 MCM': 22, 'Cable 500 MCM': 24,
};

const MODEL_DESC: Record<string, string> = {
  GRT: 'Calibres N°6 a N°4',   GRC: 'Calibres N°1 a 4/0',   GRP: 'Cable N°4 / Barra 3/4"',
  GTC: 'Cable a Varilla en T',  GYE: 'Cable de Paso a Varilla',
  NCR: 'Cable Regular',         NCF: 'Cable Flexible',
  NDR: 'Cable Regular',         NDF: 'Cable Flexible',
  SST: 'Cables N°4 a N°1',     SSC: 'Cables N°1/0 a 4/0',
  VVC: 'Cables N°4 a N°1',     VVR: 'Cables N°1/0 a 4/0',
};

/* ---- Detection & Parsing ---- */

function detectMode(variants: Props['variants']): ConfigMode {
  if (!variants.some(v => v.group)) return 'flat';
  const groups = [...new Set(variants.map(v => v.group).filter(Boolean))] as string[];
  if (groups.length <= 1) return 'flat';
  const hasBars = groups.some(g => g.includes(' \u2014 Barra '));
  if (hasBars) {
    const models = [...new Set(groups.map(g => g.split(' \u2014 Barra ')[0]))];
    return models.length === 1 ? 'two-step-bar' : 'three-step';
  }
  return 'two-step-model';
}

function parseHierarchy(variants: Props['variants'], mode: ConfigMode): ModelData[] {
  if (mode === 'flat') return [];
  const map = new Map<string, ModelData>();

  if (mode === 'three-step' || mode === 'two-step-bar') {
    for (const v of variants) {
      const g = v.group || '';
      const sep = g.indexOf(' \u2014 Barra ');
      const modelCode = sep > -1 ? g.substring(0, sep) : g;
      const barSize = sep > -1 ? g.substring(sep + 9) : '';
      if (!map.has(modelCode)) map.set(modelCode, { code: modelCode, bars: [] });
      const model = map.get(modelCode)!;
      let bar = model.bars!.find(b => b.size === barSize);
      if (!bar) { bar = { size: barSize, cables: [] }; model.bars!.push(bar); }
      bar.cables.push({ id: v.id, label: v.label, group: g });
    }
  } else {
    for (const v of variants) {
      const code = v.group || '';
      if (!map.has(code)) map.set(code, { code, cables: [] });
      map.get(code)!.cables!.push({ id: v.id, label: v.label, group: code });
    }
  }

  return [...map.values()];
}

/* ---- Shared SVG ---- */

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/* ============================================
   MAIN COMPONENT
   ============================================ */

export default function VariantSelector({ sku, title, category, image, variants, onAdd }: Props) {
  const mode = useMemo(() => detectMode(variants), [variants]);

  if (mode === 'flat') {
    return <FlatSelector sku={sku} title={title} category={category} image={image} variants={variants} onAdd={onAdd} />;
  }

  return <StepConfigurator sku={sku} title={title} category={category} image={image} variants={variants} onAdd={onAdd} mode={mode} />;
}

/* ============================================
   FLAT SELECTOR (preserved original behavior)
   ============================================ */

function FlatSelector({ sku, title, category, image, variants, onAdd }: Props) {
  const cart = useStore($cart);

  const [state, setState] = useState<Record<string, VariantState>>(() => {
    const initial: Record<string, VariantState> = {};
    for (const v of variants) initial[v.id] = { selected: false, quantity: 1 };
    return initial;
  });

  const selectedCount = Object.values(state).filter(s => s.selected).length;

  const toggleVariant = (id: string) => {
    setState(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
  };

  const setQuantity = (id: string, qty: number) => {
    const q = Math.max(1, Math.min(99, qty));
    setState(prev => ({ ...prev, [id]: { ...prev[id], quantity: q, selected: true } }));
  };

  const handleAdd = () => {
    const toAdd = variants.filter(v => state[v.id].selected);
    if (toAdd.length === 0) return;
    for (const v of toAdd) {
      addItem({
        sku, title, category, quantity: state[v.id].quantity, image,
        variant: v.group ? `${v.group} \u2014 ${v.label}` : v.label,
      });
    }
    const msg = toAdd.length === 1
      ? `${toAdd[0].label} agregado a la cotización`
      : `${toAdd.length} variantes de ${title} agregadas a la cotización`;
    showToast(msg, 'success');
    setState(prev => {
      const reset: Record<string, VariantState> = {};
      for (const key of Object.keys(prev)) reset[key] = { selected: false, quantity: 1 };
      return reset;
    });
    onAdd?.();
  };

  const getCartQty = (v: { label: string; group?: string }): number => {
    const variantLabel = v.group ? `${v.group} \u2014 ${v.label}` : v.label;
    const item = cart.find(i => i.sku === sku && i.variant === variantLabel);
    return item ? item.quantity : 0;
  };

  /* Grouping logic */
  const hasGroups = variants.some(v => v.group);
  const subtypes = hasGroups
    ? [...new Set(variants.map(v => {
        const g = v.group || '';
        const idx = g.indexOf(' \u2014 ');
        return idx > -1 ? g.substring(0, idx) : g;
      }))]
    : [];
  const uniqueGroups = hasGroups ? [...new Set(variants.map(v => v.group).filter(Boolean))] : [];
  const isSingleGroup = uniqueGroups.length === 1;
  const grouped = hasGroups && !isSingleGroup
    ? variants.reduce<Array<{ group: string; items: typeof variants }>>((acc, v) => {
        const g = v.group || '';
        const existing = acc.find(entry => entry.group === g);
        if (existing) existing.items.push(v);
        else acc.push({ group: g, items: [v] });
        return acc;
      }, [])
    : null;

  const renderVariantRow = (v: (typeof variants)[0]) => {
    const s = state[v.id];
    const cartQty = getCartQty(v);
    return (
      <label key={v.id} class={`${styles.row} ${s.selected ? styles.selected : ''}`}>
        <input type="checkbox" class={styles.checkbox} checked={s.selected} onChange={() => toggleVariant(v.id)} />
        <span class={styles.label}>
          {v.label}
          {cartQty > 0 && <span class={styles.inCart}> (en cotización: {cartQty})</span>}
        </span>
        <div class={styles.qtyControls}>
          <button type="button" class={styles.qtyBtn} onClick={(e) => { e.preventDefault(); setQuantity(v.id, s.quantity - 1); }} aria-label="Disminuir cantidad">{'\u2212'}</button>
          <input type="number" class={styles.qtyInput} min="1" max="99" value={s.quantity} onInput={(e) => { const val = parseInt((e.target as HTMLInputElement).value); if (!isNaN(val)) setQuantity(v.id, val); }} />
          <button type="button" class={styles.qtyBtn} onClick={(e) => { e.preventDefault(); setQuantity(v.id, s.quantity + 1); }} aria-label="Aumentar cantidad">+</button>
        </div>
      </label>
    );
  };

  return (
    <div class={styles.selector}>
      {hasGroups && subtypes.length > 0 && (
        <div class={styles.modelInfo}>
          <span class={styles.modelLabel}>{subtypes.length === 1 ? 'Modelo' : 'Modelos disponibles'}</span>
          <span class={styles.modelName}>
            {subtypes.map((name, i) => (
              <span key={name}>
                {i > 0 && <span class={styles.modelSeparator}>/</span>}
                {name}
              </span>
            ))}
          </span>
        </div>
      )}

      <div class={styles.selectorHeading}>
        <span class={styles.headingText}>Seleccionar variante</span>
        <span class={styles.headingCount}>
          {selectedCount > 0 ? `${selectedCount} / ${variants.length}` : `${variants.length} opciones`}
        </span>
      </div>

      <div class={styles.list}>
        {grouped
          ? grouped.map(({ group, items }) => (
              <div key={group}>
                <div class={styles.groupDivider}>{group}</div>
                {items.map(renderVariantRow)}
              </div>
            ))
          : variants.map(renderVariantRow)
        }
      </div>

      <button type="button" class={styles.addBtn} onClick={handleAdd} disabled={selectedCount === 0}>
        <CartIcon />
        {selectedCount === 0
          ? 'Selecciona al menos una variante'
          : selectedCount === 1
            ? 'Agregar 1 variante a Cotización'
            : `Agregar ${selectedCount} variantes a Cotización`}
      </button>
    </div>
  );
}

/* ============================================
   STEP CONFIGURATOR (multi-step)
   ============================================ */

function StepConfigurator({ sku, title, category, image, variants, onAdd, mode }: Props & { mode: ConfigMode }) {
  const cart = useStore($cart);
  const models = useMemo(() => parseHierarchy(variants, mode), [variants, mode]);

  const hasBars = mode === 'three-step' || mode === 'two-step-bar';
  const hasModelStep = mode === 'three-step' || mode === 'two-step-model';

  const [activeModel, setActiveModel] = useState(models[0]?.code || '');
  const [activeBar, setActiveBar] = useState<string | null>(
    hasBars ? (models[0]?.bars?.[0]?.size || null) : null
  );
  const [selected, setSelected] = useState<Record<string, number>>({});

  /* Derived data */
  const currentModel = models.find(m => m.code === activeModel);
  const availableBars = hasBars ? currentModel?.bars : null;
  const currentCables = hasBars
    ? currentModel?.bars?.find(b => b.size === activeBar)?.cables
    : currentModel?.cables;

  const selectedEntries = Object.entries(selected);
  const selectedCount = selectedEntries.length;
  const totalQty = selectedEntries.reduce((sum, [, qty]) => sum + qty, 0);

  /* Handlers */
  const handleModelChange = (code: string) => {
    setActiveModel(code);
    if (hasBars) {
      const newModel = models.find(m => m.code === code);
      const bars = newModel?.bars || [];
      if (!bars.find(b => b.size === activeBar)) {
        setActiveBar(bars[0]?.size || null);
      }
    }
  };

  const toggleCable = (id: string) => {
    setSelected(prev => {
      if (id in prev) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const setCableQty = (id: string, qty: number) => {
    const q = Math.max(1, Math.min(99, qty));
    setSelected(prev => ({ ...prev, [id]: q }));
  };

  const removeSelected = (id: string) => {
    setSelected(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearAll = () => setSelected({});

  const handleAdd = () => {
    const entries = Object.entries(selected);
    if (entries.length === 0) return;
    for (const [varId, qty] of entries) {
      const v = variants.find(x => x.id === varId);
      if (!v) continue;
      addItem({
        sku, title, category, quantity: qty, image,
        variant: v.group ? `${v.group} \u2014 ${v.label}` : v.label,
      });
    }
    showToast(
      entries.length === 1
        ? '1 variante agregada a la cotización'
        : `${entries.length} variantes agregadas a la cotización`,
      'success'
    );
    setSelected({});
    onAdd?.();
  };

  /* Helpers */
  const barHasSelections = (barSize: string): boolean => {
    const bar = currentModel?.bars?.find(b => b.size === barSize);
    return bar?.cables.some(c => c.id in selected) || false;
  };

  const getChipLabel = (variantId: string): string => {
    const v = variants.find(x => x.id === variantId);
    if (!v) return variantId;
    if (mode === 'two-step-model') return `${v.group} \u00B7 ${v.label}`;
    const g = v.group || '';
    const sep = g.indexOf(' \u2014 Barra ');
    const model = sep > -1 ? g.substring(0, sep) : g;
    const bar = sep > -1 ? `\u00D8${g.substring(sep + 9)}` : '';
    if (mode === 'two-step-bar') return bar ? `${bar} ${v.label}` : v.label;
    return bar ? `${model} ${bar} ${v.label}` : `${model} \u00B7 ${v.label}`;
  };

  const getCartQty = (v: { label: string; group?: string }): number => {
    const variantLabel = v.group ? `${v.group} \u2014 ${v.label}` : v.label;
    return cart.find(i => i.sku === sku && i.variant === variantLabel)?.quantity || 0;
  };

  /* Step numbering */
  const barStepNum = hasModelStep ? 2 : 1;
  const cableStepNum = (hasModelStep ? 1 : 0) + (hasBars ? 1 : 0) + 1;

  return (
    <div class={styles.selector}>
      {/* Config header */}
      <div class={styles.configHeader}>
        <span class={styles.configTitle}>Configurar variante</span>
        <span class={styles.configCount}>{variants.length} opciones</span>
      </div>

      {/* Breadcrumb */}
      <div class={styles.breadcrumb}>
        {hasModelStep && <span class={styles.breadcrumbChip}>{activeModel}</span>}
        {hasModelStep && hasBars && activeBar && (
          <>
            <span class={styles.breadcrumbArrow}>{'\u203A'}</span>
            <span class={styles.breadcrumbChip}>{'\u00D8'}{activeBar}</span>
          </>
        )}
        {!hasModelStep && hasBars && activeBar && (
          <span class={styles.breadcrumbChip}>{'\u00D8'}{activeBar}</span>
        )}
      </div>

      {/* 2-step-bar: static model info */}
      {mode === 'two-step-bar' && models[0] && (
        <div class={styles.modelStatic}>
          <span class={styles.modelStaticLabel}>Modelo:</span>
          <span class={styles.modelStaticName}>{models[0].code}</span>
        </div>
      )}

      {/* Step: Model selection (3-step, 2-step-model) */}
      {hasModelStep && (
        <div class={styles.stepSection}>
          <div class={styles.stepHeader}>
            <span class={styles.stepBadge}>1</span>
            <span class={styles.stepLabel}>
              {mode === 'three-step' ? 'Tipo de Molde' : 'Modelo'}
            </span>
          </div>
          <div class={styles.modelCards}>
            {models.map(m => (
              <div
                key={m.code}
                class={m.code === activeModel ? styles.modelCardActive : styles.modelCard}
                onClick={() => handleModelChange(m.code)}
                role="radio"
                aria-checked={m.code === activeModel}
              >
                <div class={styles.modelRadio}>
                  <div class={styles.modelRadioDot} />
                </div>
                <div class={styles.modelCardText}>
                  <span class={styles.modelCardName}>{m.code}</span>
                  {MODEL_DESC[m.code] && (
                    <span class={styles.modelCardSub}>{MODEL_DESC[m.code]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Bar selection (3-step, 2-step-bar) */}
      {hasBars && availableBars && availableBars.length > 0 && (
        <div class={styles.stepSection}>
          <div class={styles.stepHeader}>
            <span class={styles.stepBadge}>{barStepNum}</span>
            <span class={styles.stepLabel}>Di{'\u00E1'}metro de Barra</span>
          </div>
          <div class={styles.barContainer}>
            <div class={styles.barPills}>
              {availableBars.map(bar => {
                const isActive = bar.size === activeBar;
                const hasSel = !isActive && barHasSelections(bar.size);
                return (
                  <button
                    key={bar.size}
                    type="button"
                    class={isActive ? styles.barPillActive : styles.barPill}
                    onClick={() => setActiveBar(bar.size)}
                    aria-pressed={isActive}
                  >
                    {'\u00D8'} {bar.size}
                    {hasSel && <span class={styles.barDot} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step: Cable selection */}
      {currentCables && currentCables.length > 0 && (
        <div class={styles.stepSection}>
          <div class={styles.stepHeader}>
            <span class={styles.stepBadge}>{cableStepNum}</span>
            <span class={styles.stepLabel}>Calibre de Cable</span>
          </div>
          <div class={styles.cableList}>
            {currentCables.map(cable => {
              const isSelected = cable.id in selected;
              const dotSize = GAUGE_DOT[cable.label];
              const cartQty = getCartQty(cable);
              const dotOuter = dotSize ? dotSize + 10 : 18;
              const dotInner = dotSize || 8;

              return (
                <label
                  key={cable.id}
                  class={isSelected ? styles.cableRowSelected : styles.cableRow}
                >
                  <input
                    type="checkbox"
                    class={styles.cableCheckbox}
                    checked={isSelected}
                    onChange={() => toggleCable(cable.id)}
                  />
                  {dotSize && (
                    <span
                      class={styles.gaugeDot}
                      style={{ width: `${dotOuter}px`, height: `${dotOuter}px` }}
                    >
                      <span
                        class={styles.gaugeDotInner}
                        style={{ width: `${dotInner}px`, height: `${dotInner}px` }}
                      />
                    </span>
                  )}
                  <span class={styles.cableLabel}>
                    {cable.label}
                    {cartQty > 0 && (
                      <span class={styles.cableInCart}> (en cotizaci{'\u00F3'}n: {cartQty})</span>
                    )}
                  </span>
                  {isSelected && (
                    <div class={styles.qtyControls}>
                      <button
                        type="button"
                        class={styles.qtyBtn}
                        onClick={(e) => { e.preventDefault(); setCableQty(cable.id, selected[cable.id] - 1); }}
                        aria-label="Disminuir cantidad"
                      >{'\u2212'}</button>
                      <input
                        type="number"
                        class={styles.qtyInput}
                        min="1"
                        max="99"
                        value={selected[cable.id]}
                        onInput={(e) => {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val)) setCableQty(cable.id, val);
                        }}
                      />
                      <button
                        type="button"
                        class={styles.qtyBtn}
                        onClick={(e) => { e.preventDefault(); setCableQty(cable.id, selected[cable.id] + 1); }}
                        aria-label="Aumentar cantidad"
                      >+</button>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Area */}
      <div class={selectedCount > 0 ? styles.ctaAreaActive : styles.ctaArea}>
        {selectedCount > 0 ? (
          <>
            <div class={styles.ctaHeader}>
              <span class={styles.ctaCount}>
                <span class={styles.ctaCountBadge}>{selectedCount}</span>
                {selectedCount === 1 ? '1 variante' : `${selectedCount} variantes`} {'\u00B7'} {totalQty} ud.
              </span>
              <button type="button" class={styles.ctaClearBtn} onClick={clearAll}>Limpiar</button>
            </div>
            <div class={styles.chipList}>
              {selectedEntries.map(([varId, qty]) => (
                <span key={varId} class={styles.chip}>
                  {getChipLabel(varId)} {'\u00D7'}{qty}
                  <button
                    type="button"
                    class={styles.chipRemove}
                    onClick={() => removeSelected(varId)}
                    aria-label="Quitar"
                  >{'\u2715'}</button>
                </span>
              ))}
            </div>
            <button type="button" class={styles.addBtn} onClick={handleAdd}>
              <CartIcon />
              Agregar {selectedCount === 1 ? '1 variante' : `${selectedCount} variantes`} a Cotizaci{'\u00F3'}n
            </button>
          </>
        ) : (
          <div class={styles.ctaEmpty}>
            <span class={styles.ctaEmptyIcon}>{'\u2610'}</span>
            Selecciona cables para agregar a la cotizaci{'\u00F3'}n
          </div>
        )}
      </div>
    </div>
  );
}
