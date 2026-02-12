import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cartSkuMap, addItem } from '../../stores/cart';
import { openProductModal } from '../../stores/ui';
import { showToast } from '../../stores/toast';
import type { Product, Category } from '../../types';
import styles from './ProductFilter.module.css';

interface Props {
  products: Product[];
  categories: Category[];
}

// H7: Sort options
type SortOption = 'default' | 'name-asc' | 'name-desc' | 'category';

const sortLabels: Record<SortOption, string> = {
  'default': 'Destacados',
  'name-asc': 'Nombre A-Z',
  'name-desc': 'Nombre Z-A',
  'category': 'Categoría',
};

/** Product filter + search + grid. Mount with client:load on /productos. */
export default function ProductFilter({ products, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchText, setSearchText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const cartSkuMap = useStore($cartSkuMap);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchInput = (value: string) => {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchText(value), 200);
  };

  // Read initial category from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('categoria');
    if (cat && categories.some((c) => c.id === cat)) {
      setSelectedCategory(cat);
    }
  }, []);

  // Update URL when filter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selectedCategory === 'todos') {
      url.searchParams.delete('categoria');
    } else {
      url.searchParams.set('categoria', selectedCategory);
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedCategory]);

  // H7: Cmd+K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // Escape to blur search and clear
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        if (inputValue) {
          clearTimeout(debounceRef.current);
          setInputValue('');
          setSearchText('');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputValue]);

  // Filter products
  const query = searchText.toLowerCase().trim();
  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === 'todos' || p.categorySlug === selectedCategory;
    const matchSearch = !query ||
      p.title.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  // H7: Sort filtered products
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.title.localeCompare(b.title, 'es');
      case 'name-desc':
        return b.title.localeCompare(a.title, 'es');
      case 'category':
        return a.category.localeCompare(b.category, 'es');
      default:
        // Default: prioritize products with badges, then by order in array
        if (a.badge && !b.badge) return -1;
        if (!a.badge && b.badge) return 1;
        return 0;
    }
  });

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
  };

  const handleCardClick = (product: Product) => {
    openProductModal(product);
  };

  const handleAddToQuote = (e: Event, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.variants?.length) {
      openProductModal(product);
      return;
    }
    addItem({ sku: product.sku, title: product.title, category: product.category, quantity: 1, image: product.image });
    showToast(`${product.title} agregado a la cotización`, 'success');
  };

  const getCartCount = (sku: string) => cartSkuMap.get(sku) || 0;

  // Scroll reveal for dynamically rendered product cards
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Create observer once
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px' }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  // Observe only new cards when filter results change
  useEffect(() => {
    if (!gridRef.current || !observerRef.current) return;
    const observer = observerRef.current;
    const cards = gridRef.current.querySelectorAll('[data-aos]');
    if (!cards.length) return;
    if (!('IntersectionObserver' in window)) {
      cards.forEach((el) => el.classList.add('aos-animate'));
      return;
    }
    requestAnimationFrame(() => {
      cards.forEach((el) => {
        if (!el.classList.contains('aos-animate')) {
          observer.observe(el);
        }
      });
    });
  }, [sorted.length, selectedCategory, searchText]);

  return (
    <div>
      {/* Search with H7: keyboard shortcut indicator */}
      <div class={styles['search-container']}>
        <div class={styles['search-wrapper']}>
          <svg class={styles['search-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            id="product-search"
            aria-label="Buscar productos"
            class={styles['search-input']}
            placeholder="Buscar productos..."
            value={inputValue}
            onInput={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
          />
          <kbd class={styles['search-shortcut']}>⌘K</kbd>
        </div>
      </div>

      {/* Filter buttons */}
      <div class={styles['filter-container']}>
        <button
          class={`${styles['filter-btn']} ${selectedCategory === 'todos' ? styles.active : ''}`}
          onClick={() => handleCategoryClick('todos')}
          aria-pressed={selectedCategory === 'todos'}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            class={`${styles['filter-btn']} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
            aria-pressed={selectedCategory === cat.id}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* H7: Product count + sorting */}
      <div class={styles['results-bar']}>
        <p class={styles['product-count']}>
          {sorted.length} {sorted.length === 1 ? 'producto encontrado' : 'productos encontrados'}
        </p>
        <div class={styles['sort-container']}>
          <label class={styles['sort-label']} htmlFor="sort-select">Ordenar:</label>
          <select
            id="sort-select"
            class={styles['sort-select']}
            value={sortBy}
            onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as SortOption)}
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product grid */}
      {sorted.length > 0 ? (
        <div class={styles['product-grid']} ref={gridRef}>
          {sorted.map((product, index) => {
            const count = getCartCount(product.sku);
            return (
              <div
                key={product.sku}
                class={styles['product-card']}
                data-aos="fade-up"
                data-aos-delay={index % 4 > 0 ? String((index % 4) * 50) : undefined}
                onClick={() => handleCardClick(product)}
                role="button"
                tabindex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(product);
                  }
                }}
                aria-label={`Ver detalle: ${product.title}`}
              >
                <div class={styles['product-image']}>
                  {product.badge && (
                    <span class={styles['product-badge']}>{product.badge}</span>
                  )}
                  {product.image ? (
                    <img src={product.image} alt={product.title} loading={index < 4 ? "eager" : "lazy"} fetchpriority={index < 4 ? "high" : undefined} decoding="async" width="280" height="200" />
                  ) : (
                    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                      <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                      <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8" />
                      <path d="M50 75h20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div class={styles['product-content']}>
                  <span class={styles['product-category']}>{product.category}</span>
                  <h3 class={styles['product-title']}>{product.title}</h3>
                  <p class={styles['product-description']}>{product.description}</p>
                  <span class={styles['product-sku']}>SKU: {product.sku}</span>
                </div>
                <div class={styles['product-footer']}>
                  <button
                    class={`${styles['btn-add-quote']} ${count > 0 ? styles.added : ''}`}
                    onClick={(e) => handleAddToQuote(e, product)}
                    aria-label={count > 0 ? `${product.title} en cotización (${count})` : `Agregar ${product.title} a cotización`}
                  >
                    {count > 0 ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Agregado ({count})
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Cotizar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class={styles['no-results']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <h3>No se encontraron productos</h3>
          <p>Intenta con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  );
}
