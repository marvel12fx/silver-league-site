import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

interface OrderSummaryProps {
  cart: CartItem[];
  subtotal: number;
  deliveryFee: number | null;
  total: number;
}

export function OrderSummary({ cart, subtotal, deliveryFee, total }: OrderSummaryProps) {
  const feeText = deliveryFee === null ? 'To be confirmed' : deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee);

  return (
    <div className="bg-cream p-6 md:p-8 sticky top-28">
      <h2 className="font-display text-2xl text-burgundy-dark mb-6 pb-4 border-b border-burgundy/10">Your Order</h2>
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {cart.map((item, i) => (
          <div key={`${item.product.id}-${item.colour}-${item.size}-${i}`} className="flex gap-3">
            <div className="w-16 h-20 bg-white flex-shrink-0 overflow-hidden relative">
              <img src={item.product.product_colours?.find((c) => c.name === item.colour)?.images?.[0] || item.product.images?.[0] || ''} alt={item.product.name} className="w-full h-full object-cover" />
              <span className="absolute -top-1 -right-1 bg-burgundy text-cream text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm text-burgundy-dark truncate">{item.product.name}</p>
              <p className="text-xs text-silver-dark">{item.colour && <>Colour: {item.colour} · </>}Size: {item.size}</p>
              <p className="text-sm text-burgundy mt-1">{formatPrice(item.product.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3 pt-4 border-t border-burgundy/10">
        <div className="flex justify-between text-sm text-burgundy-dark/70">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-burgundy-dark/70">
          <span>Delivery</span>
          <span>{feeText}</span>
        </div>
        <div className="flex justify-between font-display text-xl text-burgundy-dark pt-3 border-t border-burgundy/10">
          <span>Total due now</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
