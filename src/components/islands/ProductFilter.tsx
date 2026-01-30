import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $cart, addItem } from '../../stores/cart';
import { openProductModal } from '../../stores/ui';
import { showToast } from '../../stores/toast';
import type { Product, Category } from '../../types';
import styles from './ProductFilter.module.css';

interface Props {
  products: Product[];
  categories: Category[];
}

/** Product filter + search + grid. Mount with client:load on /productos. */
export default function ProductFilter({ products, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchText, setSearchText] = useState('');
  const cart = useStore($cart);

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

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
  };

  const handleCardClick = (product: Product) => {
    openProductModal(product);
  };

  const handleAddToQuote = (e: Event, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    addItem({ sku: product.sku, title: product.title, category: product.category, quantity: 1, image: product.image });
    showToast(`${product.title} agregado a la cotización`, 'success');
  };

  const isInCart = (sku: string) => cart.find((item) => item.sku === sku);

  return (
    <div>
      {/* Search */}
      <div class={styles['search-container']}>
        <div class={styles['search-wrapper']}>
          <svg class={styles['search-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            class={styles['search-input']}
            placeholder="Buscar productos..."
            value={searchText}
            onInput={(e) => setSearchText((e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      {/* Filter buttons */}
      <div class={styles['filter-container']}>
        <button
          class={`${styles['filter-btn']} ${selectedCategory === 'todos' ? styles.active : ''}`}
          onClick={() => handleCategoryClick('todos')}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            class={`${styles['filter-btn']} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product count */}
      <p class={styles['product-count']}>
        {filtered.length} {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}
      </p>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div class={styles['product-grid']}>
          {filtered.map((product) => {
            const existing = isInCart(product.sku);
            return (
              <article
                key={product.sku}
                class={styles['product-card']}
                onClick={() => handleCardClick(product)}
              >
                <div class={styles['product-image']}>
                  {product.badge && (
                    <span class={styles['product-badge']}>{product.badge}</span>
                  )}
                  {product.image ? (
                    <img src={product.image} alt={product.title} loading="lazy" />
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
                    class={`${styles['btn-add-quote']} ${existing ? styles.added : ''}`}
                    onClick={(e) => handleAddToQuote(e, product)}
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
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div class={styles['no-results']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
