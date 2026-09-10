import { Link } from '@/lib/router';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/lib/types';
import { Heart } from 'lucide-react';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);
  const primaryImage = product.images?.[0] || '';
  const hoverImage = product.images?.[1] || primaryImage;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div
      className="group cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-cream aspect-[3/4] mb-4">
          <img
            src={primaryImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0"
            loading="lazy"
          />
          <img
            src={hoverImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_new && (
              <span className="bg-burgundy text-cream text-[9px] tracking-luxe uppercase px-3 py-1">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-cream text-burgundy text-[9px] tracking-luxe uppercase px-3 py-1">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart
              size={16}
              className={wished ? 'fill-burgundy text-burgundy' : 'text-burgundy'}
            />
          </button>

          {/* Quick view overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-burgundy/90 text-cream text-center py-3 text-[10px] tracking-luxe uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            View Product
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">
            {product.categories?.name || 'SILVER LEAGUE'}
          </p>
          <h3 className="font-display text-base text-burgundy-dark mb-2 group-hover:text-burgundy transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-burgundy-dark">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-silver line-through">{formatPrice(product.compare_at_price!)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
