import { formatPrice } from '@/lib/utils';
import type { DeliveryStatus, Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { MessageCircle, MapPin, Truck } from 'lucide-react';

const WHATSAPP_NUMBER = '2349010480020';

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
export const PICKUP_DELIVERY_STATUSES: DeliveryStatus[] = ['not_started', 'preparing', 'ready_for_pickup', 'picked_up'];
export const DOORSTEP_DELIVERY_STATUSES: DeliveryStatus[] = ['not_started', 'preparing', 'out_for_delivery', 'delivered'];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  not_started: 'Not started',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  picked_up: 'Picked up',
};

const ZONE_LABELS: Record<string, string> = {
  lagos: 'Lagos',
  nigeria: 'Other Nigerian locations',
  worldwide: 'Worldwide',
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    paid: 'bg-green-50 text-green-800 border-green-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    failed: 'bg-red-50 text-red-800 border-red-200',
    abandoned: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] tracking-luxe uppercase border ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] tracking-luxe uppercase border ${styles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
}

export function DeliveryMethodLabel({ order }: { order: Order }) {
  if (order.delivery_method === 'pickup') return <>Self-pickup</>;
  const zone = order.delivery_zone ? ZONE_LABELS[order.delivery_zone] : '';
  return <>Doorstep{zone ? ` · ${zone}` : ''}</>;
}

export function OrderDetail({
  order,
  saving,
  error,
  onBack,
  onUpdateField,
}: {
  order: Order;
  saving: string | null;
  error: string | null;
  onBack: () => void;
  onUpdateField: (field: 'status' | 'delivery_status', value: string) => void;
}) {
  const isPickup = order.delivery_method === 'pickup';
  const deliveryOptions = isPickup ? PICKUP_DELIVERY_STATUSES : DOORSTEP_DELIVERY_STATUSES;
  const address = order.shipping_address;
  const whatsappPhone = order.customer_phone?.replace(/[^0-9]/g, '') || WHATSAPP_NUMBER;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-burgundy hover:underline mb-6">
        ← Back to Orders
      </button>
      <div className="bg-white border border-gray-100 p-6 md:p-8 space-y-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p className="font-display text-2xl text-burgundy-dark">{order.order_number}</p>
            <p className="text-sm text-silver-dark">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PaymentBadge status={order.payment_status} />
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
          <div>
            <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Customer</p>
            <p className="text-sm text-burgundy-dark">{order.customer_name}</p>
            {order.customer_email && <p className="text-sm text-silver-dark break-all">{order.customer_email}</p>}
            {order.customer_phone && <p className="text-sm text-silver-dark">{order.customer_phone}</p>}
            <a
              href={`https://wa.me/${whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-burgundy hover:underline mt-2"
            >
              <MessageCircle size={14} /> Contact on WhatsApp
            </a>
          </div>
          <div>
            <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-2">
              {isPickup ? 'Pickup' : 'Delivery Address'}
            </p>
            {isPickup ? (
              <div className="flex gap-2 text-sm text-burgundy-dark">
                <MapPin size={16} className="text-silver-dark flex-shrink-0 mt-0.5" />
                <p>{order.pickup_location || 'Park location'}</p>
              </div>
            ) : (
              <div className="flex gap-2 text-sm text-burgundy-dark">
                <Truck size={16} className="text-silver-dark flex-shrink-0 mt-0.5" />
                <div>
                  <p>{address?.line1}</p>
                  {address?.line2 && <p className="text-silver-dark">{address.line2}</p>}
                  <p className="text-silver-dark">{[address?.city, address?.state].filter(Boolean).join(', ')}</p>
                  <p className="text-silver-dark">{address?.country}</p>
                  {address?.postal_code && <p className="text-silver-dark">Postal code: {address.postal_code}</p>}
                </div>
              </div>
            )}
            <p className="text-xs text-silver-dark mt-3">
              Method: <DeliveryMethodLabel order={order} />
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-3">Items</p>
          <div className="space-y-3">
            {(order.order_items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <div className="flex gap-3">
                  {item.product_image && <img src={item.product_image} alt="" className="w-12 h-16 object-cover bg-cream" />}
                  <div>
                    <p className="text-burgundy-dark">{item.product_name}</p>
                    <p className="text-xs text-silver-dark">
                      {item.colour && <>Colour: {item.colour} · </>}Size: {item.size ?? '-'} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-burgundy-dark whitespace-nowrap">{formatPrice(Number(item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm text-silver-dark">
            <span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm text-silver-dark">
            <span>Delivery fee</span><span>{Number(order.delivery_fee) === 0 ? 'Free' : formatPrice(Number(order.delivery_fee))}</span>
          </div>
          <div className="flex justify-between font-display text-lg text-burgundy-dark">
            <span>Total</span><span>{formatPrice(Number(order.total))}</span>
          </div>
          <p className="text-xs text-silver-dark">
            Payment: <span className="capitalize">{order.payment_status}</span>
            {order.paystack_reference && <> · Ref {order.paystack_reference}</>}
            {order.paid_at && <> · Paid {new Date(order.paid_at).toLocaleString()}</>}
          </p>
        </div>

        {order.notes && (
          <div className="p-4 bg-cream">
            <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">Order Notes</p>
            <p className="text-sm text-burgundy-dark">{order.notes}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div>
            <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Order status</label>
            <select
              value={order.status}
              disabled={saving === 'status'}
              onChange={(e) => onUpdateField('status', e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white disabled:opacity-60"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">
              {isPickup ? 'Pickup status' : 'Delivery status'}
            </label>
            <select
              value={deliveryOptions.includes(order.delivery_status) ? order.delivery_status : 'not_started'}
              disabled={saving === 'delivery_status'}
              onChange={(e) => onUpdateField('delivery_status', e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white disabled:opacity-60"
            >
              {deliveryOptions.map((s) => (
                <option key={s} value={s}>{DELIVERY_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
