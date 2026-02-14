import { useState, useEffect, useRef, useMemo, useCallback } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cartSkuMap, addItem } from '../../stores/cart';
import { showToast } from '../../stores/toast';
import type { ProductSlim, Category } from '../../types';
import { slugify } from '../../utils/slugify';
import { applicationTags } from '../../data/application-tags';
import { getCategoryPlaceholderSvg } from '../../utils/category-placeholders';
import styles from './ProductFilter.module.css';

interface Props {
  products: ProductSlim[];
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('todos');
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

  // Filter products (memoized)
  const query = searchText.toLowerCase().trim();
  const filtered = useMemo(() => products.filter((p) => {
    const matchCategory = selectedCategory === 'todos' || p.categorySlug === selectedCategory;
    const matchSubcategory = selectedSubcategory === 'todos' || (p.subcategories?.includes(selectedSubcategory) ?? false);
    const matchSearch = !query ||
      p.title.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchCategory && matchSubcategory && matchSearch;
  }), [products, selectedCategory, selectedSubcategory, query]);

  // Extract subcategories from products in the selected category (memoized)
  const subcategories = useMemo(() => selectedCategory !== 'todos'
    ? [...new Set(
        products
          .filter((p) => p.categorySlug === selectedCategory && p.subcategories?.length)
          .flatMap((p) => p.subcategories!)
      )].sort((a, b) => a.localeCompare(b, 'es'))
    : [], [products, selectedCategory]);

  // H7: Sort filtered products (memoized)
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
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
  }), [filtered, sortBy]);

  const handleCategoryClick = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('todos');
  }, []);

  const getProductUrl = useCallback((product: ProductSlim) => `/productos/${slugify(product.title)}`, []);

  const handleAddToQuote = useCallback((e: Event, product: ProductSlim) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.hasVariants) {
      window.location.href = getProductUrl(product);
      return;
    }
    addItem({ sku: product.sku, title: product.title, category: product.category, quantity: 1, image: product.image });
    showToast(`${product.title} agregado a la cotización`, 'success');
  }, [getProductUrl]);

  const getCartCount = useCallback((sku: string) => cartSkuMap.get(sku) || 0, [cartSkuMap]);

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
          <svg class={styles['search-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
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
          {inputValue ? (
            <button
              class={styles['search-clear']}
              onClick={() => {
                clearTimeout(debounceRef.current);
                setInputValue('');
                setSearchText('');
                searchInputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ) : (
            <kbd class={styles['search-shortcut']}>⌘K</kbd>
          )}
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

      {/* Subcategory filter pills */}
      {subcategories.length > 1 && (
        <div class={styles['subcategory-container']}>
          <button
            class={`${styles['subcategory-btn']} ${selectedSubcategory === 'todos' ? styles.active : ''}`}
            onClick={() => setSelectedSubcategory('todos')}
            aria-pressed={selectedSubcategory === 'todos'}
          >
            Todos
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              class={`${styles['subcategory-btn']} ${selectedSubcategory === sub ? styles.active : ''}`}
              onClick={() => setSelectedSubcategory(sub)}
              aria-pressed={selectedSubcategory === sub}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

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
              <a
                key={product.sku}
                href={getProductUrl(product)}
                class={styles['product-card']}
                data-aos="fade-up"
                data-aos-delay={index % 4 > 0 ? String((index % 4) * 50) : undefined}
                data-astro-prefetch="hover"
              >
                <div class={styles['product-image']}>
                  {product.badge && (
                    <span class={styles['product-badge']}>{product.badge}</span>
                  )}
                  {product.image ? (
                    <img src={product.image} alt={product.title} loading={index < 4 ? "eager" : "lazy"} fetchpriority={index < 4 ? "high" : undefined} decoding="async" width="300" height="200" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 768px) calc(50vw - 24px), (max-width: 1024px) calc(33.33vw - 24px), 280px" />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: getCategoryPlaceholderSvg(product.categorySlug) }} />
                  )}
                  {product.imageCount != null && product.imageCount > 1 && (
                    <span class={styles['image-count-badge']}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      {product.imageCount}
                    </span>
                  )}
                </div>
                <div class={styles['product-content']}>
                  <div class={styles['product-meta-row']}>
                    <span class={styles['product-category']}>{product.category}</span>
                    {product.hasVariants && (
                      <span class={styles['variant-indicator']}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="3" y="14" width="7" height="7" rx="1"/>
                          <rect x="14" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        Variantes
                      </span>
                    )}
                  </div>
                  {(applicationTags[product.categorySlug] || []).length > 0 && (
                    <div class={styles['application-tags']}>
                      {(applicationTags[product.categorySlug] || []).map((tag) => (
                        <span key={tag} class={styles['app-tag']}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <h3 class={styles['product-title']}>{product.title}</h3>
                  <p class={styles['product-description']}>{product.description}</p>
                  <div class={styles['product-sku-row']}>
                    <span class={styles['product-sku']}>SKU: {product.sku}</span>
                    <span class={`${styles['card-stock']} ${!product.inStock ? styles['out-stock'] : ''}`}>
                      <span class={styles['stock-dot']}></span>
                      {product.inStock ? 'En Stock' : 'Sin Stock'}
                    </span>
                  </div>
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
              </a>
            );
          })}
        </div>
      ) : (
        <div class={styles['no-results']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64" aria-hidden="true">
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
