import { useRouter } from '@/lib/router';
import { useProducts } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { Link } from '@/lib/router';
import { Search } from 'lucide-react';

export function SearchPage() {
  const { route } = useRouter();
  const query = route.query.get('q') || '';
  const { products, loading } = useProducts({ search: query, sort: 'newest' });

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-12 md:py-16 px-4 md:px-8 text-center">
        <Search size={28} className="text-burgundy mx-auto mb-4" />
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Search Results</p>
        <h1 className="font-display text-3xl md:text-4xl text-burgundy-dark mb-2">
          {query ? `"${query}"` : 'Search'}
        </h1>
        {!loading && (
          <p className="text-burgundy-dark/60 text-sm">
            {products.length} result{products.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-cream animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display text-2xl text-burgundy-dark mb-4">No results found</p>
            <p className="text-sm text-silver-dark mb-8">
              We couldn't find any pieces matching "{query}". Try a different search term.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
