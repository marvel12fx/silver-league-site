import { useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { useProducts, useCategories, useCollections } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export function ShopPage() {
  const { route } = useRouter();
  const categoryFilter = route.query.get('category') || '';
  const collectionFilter = route.query.get('collection') || '';
  const searchQuery = route.query.get('q') || '';
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { products, loading } = useProducts({
    category: categoryFilter || undefined,
    collection: collectionFilter || undefined,
    search: searchQuery || undefined,
    sort,
  });
  const { categories } = useCategories();
  const { collections } = useCollections();

  const activeCategoryName = useMemo(() => {
    if (!categoryFilter) return null;
    return categories.find((c) => c.slug === categoryFilter)?.name || null;
  }, [categoryFilter, categories]);

  const updateCategory = (slug: string) => {
    const q = new URLSearchParams(route.query);
    if (slug) q.set('category', slug);
    else q.delete('category');
    window.location.hash = `/shop?${q.toString()}`;
  };

  const updateCollection = (slug: string) => {
    const q = new URLSearchParams(route.query);
    if (slug) q.set('collection', slug);
    else q.delete('collection');
    window.location.hash = `/shop?${q.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-cream py-16 md:py-24 px-4 md:px-8 text-center">
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">The Boutique</p>
        <h1 className="font-display text-4xl md:text-6xl text-burgundy-dark mb-4">
          {activeCategoryName || (searchQuery ? `Search: "${searchQuery}"` : 'Shop All')}
        </h1>
        <p className="text-burgundy-dark/60 text-sm">
          {loading ? 'Loading...' : `${products.length} piece${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs tracking-luxe uppercase text-burgundy-dark hover:opacity-60 transition-opacity"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-luxe uppercase text-silver-dark hidden md:inline">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs tracking-luxe uppercase bg-transparent border-b border-burgundy text-burgundy-dark outline-none pb-1 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className={`w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-28 space-y-8">
              {/* Category */}
              <div>
                <h3 className="text-[10px] tracking-wider-luxe uppercase text-burgundy-dark mb-4 pb-2 border-b border-gray-100">Category</h3>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      onClick={() => updateCategory('')}
                      className={`text-sm transition-colors ${!categoryFilter ? 'text-burgundy font-medium' : 'text-burgundy-dark/60 hover:text-burgundy'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => updateCategory(cat.slug)}
                        className={`text-sm transition-colors ${categoryFilter === cat.slug ? 'text-burgundy font-medium' : 'text-burgundy-dark/60 hover:text-burgundy'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collection */}
              <div>
                <h3 className="text-[10px] tracking-wider-luxe uppercase text-burgundy-dark mb-4 pb-2 border-b border-gray-100">Collection</h3>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      onClick={() => updateCollection('')}
                      className={`text-sm transition-colors ${!collectionFilter ? 'text-burgundy font-medium' : 'text-burgundy-dark/60 hover:text-burgundy'}`}
                    >
                      All Collections
                    </button>
                  </li>
                  {collections.map((col) => (
                    <li key={col.id}>
                      <button
                        onClick={() => updateCollection(col.slug)}
                        className={`text-sm transition-colors ${collectionFilter === col.slug ? 'text-burgundy font-medium' : 'text-burgundy-dark/60 hover:text-burgundy'}`}
                      >
                        {col.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-cream animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32">
                <p className="font-display text-2xl text-burgundy-dark mb-4">No pieces found</p>
                <p className="text-sm text-silver-dark">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      {showFilters && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
