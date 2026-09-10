import { useCollections, useProducts } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { Link } from '@/lib/router';
import { ArrowLeft } from 'lucide-react';

export function CollectionDetailPage({ slug }: { slug: string }) {
  const { collections } = useCollections();
  const collection = collections.find((c) => c.slug === slug);
  const { products, loading } = useProducts({ collection: slug });

  if (!collection && !collections.length) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
        <p className="font-display text-3xl text-burgundy-dark mb-4">Collection not found</p>
        <Link to="/collections" className="text-burgundy text-xs tracking-luxe uppercase border-b border-burgundy pb-1">
          View All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={collection.editorial_image || collection.cover_image || ''}
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] tracking-wider-luxe uppercase text-cream/80 mb-4">The Collection</p>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-4">{collection.name}</h1>
          <p className="text-cream/80 text-sm max-w-xl">{collection.description}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <Link to="/collections" className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-silver-dark hover:text-burgundy transition-colors mb-8">
          <ArrowLeft size={14} /> All Collections
        </Link>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-cream animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-display text-2xl text-burgundy-dark mb-4">No pieces in this collection yet</p>
            <Link to="/shop" className="text-burgundy text-xs tracking-luxe uppercase border-b border-burgundy pb-1">
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
