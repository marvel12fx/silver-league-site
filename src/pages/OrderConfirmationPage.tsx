import { useCallback, useEffect, useState } from 'react';
import { useRouter, Link } from '@/lib/router';
import { useSiteContent } from '@/lib/hooks';
import { callFunction } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { OrderSummary, PaymentStatus } from '@/lib/types';
import type { PickupSettings } from '@/lib/delivery';
import { AlertCircle, Check, Clock, Loader2, MessageCircle, RefreshCw } from 'lucide-react';

const WHATSAPP_NUMBER = '2349010480020';

const STATUS_COPY: Record<PaymentStatus, { title: string; text: string; icon: 'check' | 'clock' | 'alert' }> = {
  paid: {
    title: 'Payment Confirmed',
    text: 'Thank you. Your payment has been verified and your order is being prepared with care. A confirmation email is on its way to you.',
    icon: 'check',
  },
  pending: {
    title: 'Payment Pending',
    text: 'We have not received confirmation of your payment yet. If you have just paid, check again in a moment. Otherwise you can complete payment below.',
    icon: 'clock',
  },
  failed: {
    title: 'Payment Unsuccessful',
    text: 'Your payment was not successful, so your order is still awaiting payment. You can try again below.',
    icon: 'alert',
  },
  abandoned: {
    title: 'Payment Not Completed',
    text: 'Your payment was cancelled before it was completed, so your order is still awaiting payment. You can pay now below.',
    icon: 'alert',
  },
};

function deliveryText(order: OrderSummary): string {
  if (order.delivery_method === 'pickup') {
    return `Self-pickup at ${order.pickup_location ?? 'our Park location'}`;
  }
  if (order.delivery_zone === 'worldwide') return 'Worldwide shipping (fee confirmed by our team)';
  if (order.delivery_zone === 'lagos') return 'Doorstep delivery within Lagos';
  return 'Doorstep delivery within Nigeria';
}

function buildWhatsAppLink(order: OrderSummary): string {
  const lines = [
    `Hello SILVER LEAGUE, I would like to follow up on order ${order.order_number}.`,
    `Items: ${order.order_items.reduce((sum, i) => sum + i.quantity, 0)}`,
    `Total: ${formatPrice(order.total)}`,
    `Delivery: ${order.delivery_method === 'pickup' ? 'Self-pickup' : 'Doorstep'}`,
    `Payment status: ${order.payment_status}`,
  ];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function WhatsAppButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-3 border border-burgundy text-burgundy px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors"
    >
      <MessageCircle size={16} /> Contact Us on WhatsApp
    </a>
  );
}

export function OrderConfirmationPage() {
  const { route } = useRouter();
  const reference = route.query.get('reference') || route.query.get('trxref') || '';
  const { data: pickupData } = useSiteContent('pickup');
  const pickup = (pickupData ?? null) as PickupSettings | null;

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(reference));
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callFunction<{ order: OrderSummary }>('verify-payment', { reference });
      if (!result.order || typeof result.order.order_number !== 'string') {
        throw new Error('Unexpected response from the server. Please try again.');
      }
      setOrder(result.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not check your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (reference) verify();
  }, [reference, verify]);

  const payNow = async () => {
    if (!order) return;
    setRetrying(true);
    setError(null);
    try {
      const started = await callFunction<{ authorization_url: string }>('start-payment', {
        order_number: order.order_number,
        reference,
        callback_url: `${window.location.origin}${window.location.pathname}`,
      });
      window.location.href = started.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not be started. Please try again.');
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32">
        <Loader2 size={28} className="text-burgundy animate-spin mb-6" />
        <p className="text-xs tracking-luxe uppercase text-silver-dark">Confirming your payment...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32 text-center">
        <AlertCircle size={32} className="text-burgundy mb-6" />
        <h1 className="font-display text-3xl md:text-4xl text-burgundy-dark mb-4">We could not load your order</h1>
        <p className="text-sm text-burgundy-dark/70 max-w-md mb-8">
          {error ?? 'This page needs a payment reference from Paystack. If you have paid, please contact us on WhatsApp and we will confirm your order.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {reference && (
            <button
              type="button"
              onClick={verify}
              className="bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
            >
              Try Again
            </button>
          )}
          <Link to="/shop" className="border border-burgundy text-burgundy px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_COPY[order.payment_status] ?? STATUS_COPY.pending;
  const Icon = status.icon === 'check' ? Check : status.icon === 'clock' ? Clock : AlertCircle;
  const canPay = order.payment_status !== 'paid';

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="flex flex-col items-center text-center mb-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 ${
            status.icon === 'check' ? 'bg-burgundy text-cream animate-scale-in' : 'bg-cream text-burgundy'
          }`}>
            <Icon size={28} />
          </div>
          <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Order {order.order_number}</p>
          <h1 className="font-display text-4xl md:text-5xl text-burgundy-dark mb-4">{status.title}</h1>
          <p className="text-burgundy-dark/70 text-sm max-w-md leading-relaxed">{status.text}</p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 p-4 mb-8">{error}</p>
        )}

        <div className="bg-cream p-6 md:p-8 space-y-6 mb-8">
          <div className="space-y-4">
            {order.order_items.map((item, i) => (
              <div key={`${item.product_name}-${i}`} className="flex justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="font-display text-burgundy-dark">{item.product_name}</p>
                  <p className="text-xs text-silver-dark">
                    {item.colour && <>Colour: {item.colour} · </>}Size: {item.size ?? '-'} · Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-burgundy-dark shrink-0">{formatPrice(Number(item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-burgundy/10 text-sm text-burgundy-dark/80">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{order.delivery_method === 'pickup' ? 'Free (pickup)' : order.delivery_zone === 'worldwide' ? 'To be confirmed' : order.delivery_fee === 0 ? 'Free' : formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-display text-xl text-burgundy-dark pt-2 border-t border-burgundy/10">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-burgundy/10 text-sm text-burgundy-dark/80 space-y-2">
            <p><span className="text-silver-dark text-xs uppercase tracking-luxe mr-2">Delivery</span>{deliveryText(order)}</p>
            {order.delivery_method === 'pickup' && (
              <>
                {pickup?.address && <p>{pickup.address}</p>}
                {pickup?.hours && <p>Hours: {pickup.hours}</p>}
                <p className="text-xs text-silver-dark">{pickup?.instructions || 'Bring your order number when you come to collect your order.'}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {canPay && (
            <>
              <button
                type="button"
                onClick={payNow}
                disabled={retrying}
                className="inline-flex items-center justify-center gap-3 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50"
              >
                {retrying ? 'Opening Paystack...' : `Pay ${formatPrice(order.total)} Now`}
              </button>
              <button
                type="button"
                onClick={verify}
                disabled={retrying}
                className="inline-flex items-center justify-center gap-2 border border-burgundy text-burgundy px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} /> Check Payment
              </button>
            </>
          )}
          <WhatsAppButton href={buildWhatsAppLink(order)} />
          <Link to="/shop" className="inline-flex items-center justify-center border border-gray-300 text-burgundy-dark/70 px-8 py-4 text-xs tracking-luxe uppercase hover:border-burgundy hover:text-burgundy transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
