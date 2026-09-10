import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { Check, ArrowLeft, MessageCircle } from 'lucide-react';

type Step = 'information' | 'shipping' | 'payment';

const WHATSAPP_NUMBER = '2349010480020';
const FREE_SHIPPING_THRESHOLD = 500000;

const shippingOptions = [
  { key: 'lagos', label: 'Lagos Delivery', desc: '1–2 business days', cost: 7000 },
  { key: 'nationwide', label: 'Nationwide Nigeria', desc: '2–5 business days', cost: 10000 },
  { key: 'worldwide', label: 'Worldwide Shipping', desc: '1–14 days — variable pricing', cost: 0 },
];

export function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useStore();
  const [step, setStep] = useState<Step>('information');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'Nigeria',
    shippingMethod: 'lagos',
    notes: '',
  });

  const selectedShipping = shippingOptions.find((o) => o.key === form.shippingMethod)!;
  const isWorldwide = form.shippingMethod === 'worldwide';
  const freeShipping = form.shippingMethod !== 'worldwide' && cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isWorldwide ? 0 : freeShipping ? 0 : selectedShipping.cost;
  const total = cartSubtotal + shippingCost;

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const orderNumber = generateOrderNumber();

    const { data: order } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: form.fullName,
        customer_email: null,
        customer_phone: form.phone,
        shipping_address: {
          line1: form.address1,
          line2: form.address2,
          city: form.city,
          state: form.state,
          postal_code: '',
          country: form.country,
        },
        shipping_method: form.shippingMethod,
        shipping_cost: shippingCost,
        subtotal: cartSubtotal,
        total,
        status: 'pending',
        notes: form.notes,
      })
      .select()
      .single();

    if (order) {
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.product_colours?.find((c) => c.name === item.colour)?.images?.[0] || item.product.images?.[0] || null,
        colour: item.colour || null,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));
      await supabase.from('order_items').insert(items);

      clearCart();
      setOrderComplete(orderNumber);
    }
    setLoading(false);
  };

  const buildWhatsAppMessage = (orderNum: string) => {
    let msg = `Hello SILVER LEAGUE, I just placed order ${orderNum}.\n\n`;
    msg += `Name: ${form.fullName}\n`;
    msg += `Phone: ${form.phone}\n`;
    msg += `Address: ${form.address1}, ${form.city}, ${form.state}, ${form.country}\n`;
    msg += `Shipping: ${selectedShipping.label}\n`;
    msg += `Subtotal: ${formatPrice(cartSubtotal)}\n`;
    if (isWorldwide) {
      msg += `Shipping: Variable (to be confirmed)\n`;
    } else {
      msg += `Shipping: ${shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}\n`;
    }
    msg += `Total: ${isWorldwide ? 'To be confirmed' : formatPrice(total)}\n`;
    msg += `\nItems:\n`;
    cart.forEach((item) => {
      msg += `- ${item.product.name} (Colour: ${item.colour || 'N/A'}, Size: ${item.size}, Qty: ${item.quantity}) - ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    return encodeURIComponent(msg);
  };

  if (orderComplete) {
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(orderComplete)}`;
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32">
        <div className="w-16 h-16 bg-burgundy text-cream rounded-full flex items-center justify-center mb-8 animate-scale-in">
          <Check size={32} />
        </div>
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Order Received</p>
        <h1 className="font-display text-4xl md:text-5xl text-burgundy-dark mb-4 text-center">Thank You for Your Order</h1>
        <p className="text-burgundy-dark/70 text-sm mb-2 text-center max-w-md">
          Your order has been received and is being prepared with care.
        </p>
        <p className="font-display text-xl text-burgundy mb-8">Order {orderComplete}</p>
        <div className="bg-cream p-6 max-w-md w-full mb-8 text-sm text-burgundy-dark/70 text-center">
          <p className="mb-4">To complete your order, please contact us on WhatsApp to arrange payment and confirm delivery.</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
          >
            <MessageCircle size={16} /> Contact Us on WhatsApp
          </a>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 border border-burgundy text-burgundy px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32">
        <p className="font-display text-3xl text-burgundy-dark mb-4">Your bag is empty</p>
        <Link to="/shop" className="text-burgundy text-xs tracking-luxe uppercase border-b border-burgundy pb-1">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'information', label: 'Information' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-10 md:py-14 px-4 md:px-8 text-center">
        <h1 className="font-display text-3xl md:text-4xl text-burgundy-dark mb-2">Checkout</h1>
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-silver-dark hover:text-burgundy transition-colors">
          <ArrowLeft size={12} /> Back to Bag
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    step === s.key ? 'bg-burgundy text-cream' :
                    steps.findIndex(x => x.key === step) > i ? 'bg-burgundy text-cream' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {steps.findIndex(x => x.key === step) > i ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] tracking-luxe uppercase ${step === s.key ? 'text-burgundy' : 'text-silver-dark'}`}>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
                </div>
              ))}
            </div>

            {step === 'information' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-2xl text-burgundy-dark mb-4">Contact & Delivery Information</h2>
                <Input label="Full Name" value={form.fullName} onChange={(v) => updateForm('fullName', v)} required />
                <Input label="Phone Number" value={form.phone} onChange={(v) => updateForm('phone', v)} type="tel" required placeholder="e.g. 0801 234 5678" />
                <Input label="Address Line 1" value={form.address1} onChange={(v) => updateForm('address1', v)} required />
                <Input label="Address Line 2 (Optional)" value={form.address2} onChange={(v) => updateForm('address2', v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={form.city} onChange={(v) => updateForm('city', v)} required />
                  <Input label="State" value={form.state} onChange={(v) => updateForm('state', v)} required />
                </div>
                <div>
                  <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => updateForm('country', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors bg-white"
                  >
                    <option>Nigeria</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>United Arab Emirates</option>
                    <option>Other</option>
                  </select>
                </div>

                <button
                  onClick={() => setStep('shipping')}
                  disabled={!form.fullName || !form.phone || !form.address1 || !form.city || !form.state}
                  className="w-full bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {step === 'shipping' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-2xl text-burgundy-dark mb-4">Shipping Method</h2>
                {shippingOptions.map((opt) => {
                  const isFree = opt.key !== 'worldwide' && cartSubtotal >= FREE_SHIPPING_THRESHOLD;
                  const displayCost = opt.key === 'worldwide' ? null : isFree ? 0 : opt.cost;
                  return (
                    <ShippingOption
                      key={opt.key}
                      name={opt.label}
                      desc={opt.desc}
                      cost={displayCost}
                      selected={form.shippingMethod === opt.key}
                      onSelect={() => updateForm('shippingMethod', opt.key)}
                    />
                  );
                })}

                {form.shippingMethod !== 'worldwide' && cartSubtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-burgundy-light bg-cream p-3">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - cartSubtotal)} more to your order for free delivery within Nigeria.
                  </p>
                )}

                <div>
                  <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Order Notes (Optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors resize-none"
                    placeholder="Special delivery instructions..."
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep('information')}
                    className="flex-1 border border-burgundy text-burgundy py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-2xl text-burgundy-dark mb-2">Payment</h2>

                <div className="border-2 border-burgundy/20 p-6 text-center bg-cream/50">
                  <MessageCircle size={32} className="text-burgundy mx-auto mb-4" />
                  <p className="text-sm text-burgundy-dark/80 mb-2 font-medium">
                    Complete your order via WhatsApp
                  </p>
                  <p className="text-xs text-silver-dark mb-4">
                    After placing your order, you will be redirected to WhatsApp to arrange payment and confirm delivery details with the SILVER LEAGUE team.
                  </p>
                  <div className="text-xs text-silver-dark border-t border-burgundy/10 pt-3 mt-3">
                    {isWorldwide ? (
                      <p>Shipping cost for worldwide orders will be confirmed via WhatsApp based on your location.</p>
                    ) : (
                      <p>Payment options will be discussed with you on WhatsApp after your order is placed.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 border border-burgundy text-burgundy py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
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
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-burgundy-dark/70">
                  <span>Shipping</span>
                  <span>
                    {isWorldwide ? 'To be confirmed' : shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-display text-xl text-burgundy-dark pt-3 border-t border-burgundy/10">
                  <span>Total</span>
                  <span>{isWorldwide ? 'To be confirmed' : formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors"
      />
    </div>
  );
}

function ShippingOption({
  name,
  desc,
  cost,
  selected,
  onSelect,
}: {
  name: string;
  desc: string;
  cost: number | null;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-4 border-2 transition-colors text-left ${
        selected ? 'border-burgundy bg-cream' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-burgundy' : 'border-gray-300'
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-burgundy" />}
        </div>
        <div>
          <p className="text-sm text-burgundy-dark font-medium">{name}</p>
          <p className="text-xs text-silver-dark">{desc}</p>
        </div>
      </div>
      <p className="text-sm text-burgundy-dark">
        {cost === null ? 'Variable' : cost === 0 ? 'Free' : formatPrice(cost)}
      </p>
    </button>
  );
}
