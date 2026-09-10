import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { Link } from '@/lib/router';
import { ProductCard } from '@/components/ProductCard';
import { Heart } from 'lucide-react';

export function WishlistPage() {
  const { wishlist, wishlistLoading } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('*, categories(*), collections(*), product_sizes(*)')
        .in('id', wishlist);
      if (data) setProducts(data as Product[]);
      setLoading(false);
    };
    fetch();
  }, [wishlist]);

  if (wishlistLoading || loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32">
        <Heart size={48} className="text-silver mb-6" />
        <p className="font-display text-3xl text-burgundy-dark mb-4">Your wishlist is empty</p>
        <p className="text-silver-dark text-sm mb-8 text-center max-w-md">
          Save your favourite pieces here by tapping the heart icon on any product.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-12 md:py-16 px-4 md:px-8 text-center">
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Saved For Later</p>
        <h1 className="font-display text-4xl md:text-5xl text-burgundy-dark">Your Wishlist</h1>
        <p className="text-burgundy-dark/60 text-sm mt-2">{products.length} piece{products.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
