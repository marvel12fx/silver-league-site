import { useStore } from '@/lib/store';
import { Link } from '@/lib/router';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, cartSubtotal } = useStore();

  const freeShippingThreshold = 500000;
  const defaultShippingCost = 10000;
  const shippingCost = cartSubtotal >= freeShippingThreshold ? 0 : defaultShippingCost;
  const total = cartSubtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32">
        <ShoppingBag size={48} className="text-silver mb-6" />
        <p className="font-display text-3xl text-burgundy-dark mb-4">Your bag is empty</p>
        <p className="text-silver-dark text-sm mb-8 text-center max-w-md">
          Discover our latest collections and add your favourite pieces to your bag.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
        >
          Continue Shopping
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-12 md:py-16 px-4 md:px-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl text-burgundy-dark">Shopping Bag</h1>
        <p className="text-burgundy-dark/60 text-sm mt-2">{cart.length} item{cart.length !== 1 ? 's' : ''} in your bag</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${item.colour}-${item.size}-${index}`} className="flex gap-4 md:gap-6 pb-6 border-b border-gray-100">
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-cream overflow-hidden">
                    <img src={item.product.product_colours?.find((c) => c.name === item.colour)?.images?.[0] || item.product.images?.[0] || ''} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">
                        {item.product.categories?.name}
                      </p>
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="font-display text-lg text-burgundy-dark hover:text-burgundy transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-silver hover:text-burgundy transition-colors"
                      aria-label="Remove"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-silver-dark mb-4">{item.colour && <>Colour: {item.colour} · </>}Size: {item.size} · SKU: {item.product.sku}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-gray-300">
                      <button
                        onClick={() => updateCartQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-burgundy-dark hover:bg-cream transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm text-burgundy-dark">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-burgundy-dark hover:bg-cream transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-display text-lg text-burgundy-dark">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/shop" className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-burgundy hover:opacity-60 transition-opacity">
              <ArrowRight size={14} className="rotate-180" /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-cream p-6 md:p-8 sticky top-28">
              <h2 className="font-display text-2xl text-burgundy-dark mb-6 pb-4 border-b border-burgundy/10">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-burgundy-dark/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-burgundy-dark/70">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-burgundy-light">
                    Add {formatPrice(freeShippingThreshold - cartSubtotal)} more for free delivery within Nigeria.
                  </p>
                )}
              </div>
              <div className="flex justify-between font-display text-xl text-burgundy-dark pt-4 border-t border-burgundy/10 mb-6">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link
                to="/checkout"
                className="block text-center bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
              >
                Proceed to Checkout
              </Link>
              <p className="text-[10px] tracking-luxe uppercase text-silver-dark text-center mt-4">
                Secure Checkout · SSL Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
