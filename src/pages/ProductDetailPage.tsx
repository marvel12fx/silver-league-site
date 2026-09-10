import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/lib/router';
import { useProduct, useProducts } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/ProductCard';
import { Heart, ShoppingBag, ArrowRight, ArrowLeft, Check, Minus, Plus, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export function ProductDetailPage({ slug }: { slug: string }) {
  const { product, loading, error } = useProduct(slug);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { navigate } = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);

  const { products: related } = useProducts({
    category: product?.categories?.slug,
    sort: 'newest',
  });

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColour(null);
    setSelectedSize(null);
    setQuantity(1);
    setAddedToCart(false);
  }, [slug]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColour]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
        <p className="font-display text-3xl text-burgundy-dark mb-4">Piece not found</p>
        <Link to="/shop" className="text-burgundy text-xs tracking-luxe uppercase border-b border-burgundy pb-1">
          Return to Shop
        </Link>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);
  const sizeStock = (size: string) => product.product_sizes?.find((ps) => ps.size === size)?.stock ?? 0;

  const colours = product.product_colours ?? [];
  const selectedColourObj = colours.find((c) => c.name === selectedColour) ?? null;
  const displayImages = selectedColourObj && selectedColourObj.images.length > 0
    ? selectedColourObj.images
    : product.images;

  const handleAddToCart = () => {
    if (colours.length > 0 && !selectedColour) {
      setShowSizeError(true);
      return;
    }
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    addToCart(product, selectedSize, quantity, selectedColour);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    if (colours.length > 0 && !selectedColour) {
      setShowSizeError(true);
      return;
    }
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    addToCart(product, selectedSize, quantity, selectedColour);
    navigate('/cart');
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-silver-dark hover:text-burgundy transition-colors">
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>

      {/* Product main */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible scrollbar-hide">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-24 md:w-24 md:h-28 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-burgundy' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 relative overflow-hidden bg-cream aspect-[3/4]">
              <img
                src={displayImages[selectedImage] || displayImages[0] || product.images[0] || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-burgundy text-cream text-[9px] tracking-luxe uppercase px-3 py-1.5">
                  Sale
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">
                {product.categories?.name} · {product.collections?.name || 'SILVER LEAGUE'}
              </p>
              <h1 className="font-display text-3xl md:text-4xl text-burgundy-dark mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl text-burgundy-dark">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-lg text-silver line-through">{formatPrice(product.compare_at_price!)}</span>
                )}
              </div>
              <p className="text-[10px] tracking-luxe uppercase text-silver-dark">SKU: {product.sku}</p>
            </div>

            <div className="mb-8">
              <p className="text-burgundy-dark/70 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Colour selection */}
            {colours.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] tracking-wider-luxe uppercase text-burgundy-dark mb-3">
                  Colour{selectedColour && <span className="text-silver-dark normal-case tracking-normal ml-2">— {selectedColour}</span>}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colours.map((colour) => {
                    const isSelected = selectedColour === colour.name;
                    const thumb = colour.images?.[0];
                    return (
                      <button
                        key={colour.id}
                        onClick={() => {
                          setSelectedColour(colour.name);
                          setShowSizeError(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 border transition-all ${
                          isSelected
                            ? 'border-burgundy bg-burgundy text-cream'
                            : 'border-gray-300 text-burgundy-dark hover:border-burgundy'
                        }`}
                      >
                        {thumb ? (
                          <img src={thumb} alt={colour.name} className="w-6 h-8 object-cover" />
                        ) : (
                          <span className="w-6 h-8 bg-cream" />
                        )}
                        <span className="text-xs tracking-luxe uppercase">{colour.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] tracking-wider-luxe uppercase text-burgundy-dark">Select Size</h3>
                <button className="text-[10px] tracking-luxe uppercase text-silver-dark hover:text-burgundy transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const stock = sizeStock(size);
                  const outOfStock = stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setShowSizeError(false);
                      }}
                      disabled={outOfStock}
                      className={`min-w-[3rem] px-4 py-3 text-sm border transition-all ${
                        selectedSize === size
                          ? 'border-burgundy bg-burgundy text-cream'
                          : outOfStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-300 text-burgundy-dark hover:border-burgundy'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {showSizeError && (
                <p className="text-burgundy text-xs mt-2 animate-fade-in">
                  {colours.length > 0 && !selectedColour
                    ? 'Please select a colour.'
                    : 'Please select a size.'}
                </p>
              )}
              {selectedSize && sizeStock(selectedSize) <= 5 && sizeStock(selectedSize) > 0 && (
                <p className="text-burgundy-light text-xs mt-2">Only {sizeStock(selectedSize)} left in {selectedSize}.</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-[10px] tracking-wider-luxe uppercase text-burgundy-dark mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-burgundy-dark hover:bg-cream transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm text-burgundy-dark">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-burgundy-dark hover:bg-cream transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
              >
                {addedToCart ? (
                  <><Check size={16} /> Added to Bag</>
                ) : (
                  <><ShoppingBag size={16} /> Add to Bag</>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 border border-burgundy text-burgundy py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-14 border border-gray-300 flex items-center justify-center hover:border-burgundy transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} className={wished ? 'fill-burgundy text-burgundy' : 'text-burgundy'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-burgundy-dark/70">
                <Truck size={18} className="text-burgundy" />
                <span>Free delivery within Nigeria on orders above ₦500,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-burgundy-dark/70">
                <RotateCcw size={18} className="text-burgundy" />
                <span>Returns accepted within 24 hours of delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-burgundy-dark/70">
                <ShieldCheck size={18} className="text-burgundy" />
                <span>Authenticity guaranteed on every piece</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 px-4 md:px-8 bg-cream">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">You May Also Like</p>
              <h2 className="font-display text-3xl md:text-4xl text-burgundy-dark">Complete the Look</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
