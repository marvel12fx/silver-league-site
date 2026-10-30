import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Link } from '@/lib/router';
import { useSiteContent } from '@/lib/hooks';
import { callFunction } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { quoteDelivery, DeliverySettings, PickupSettings } from '@/lib/delivery';
import type { CheckoutForm } from '@/lib/types';
import { ArrowLeft, Lock } from 'lucide-react';
import { CheckoutInput } from '@/components/checkout/CheckoutFields';
import { DeliveryChoice, WORLDWIDE_COUNTRIES } from '@/components/checkout/DeliveryChoice';
import { OrderSummary } from '@/components/checkout/OrderSummary';

type Step = 'information' | 'delivery' | 'payment';

const STEPS: { key: Step; label: string }[] = [
  { key: 'information', label: 'Information' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'payment', label: 'Payment' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: CheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  method: 'doorstep',
  zone: 'lagos',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: 'Nigeria',
  notes: '',
};

export function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useStore();
  const { data: deliverySettings, loading: settingsLoading } = useSiteContent('delivery_settings');
  const { data: pickupSettings } = useSiteContent('pickup');
  const [step, setStep] = useState<Step>('information');
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const informationValid = form.fullName.trim().length > 1 && EMAIL_PATTERN.test(form.email.trim()) && form.phone.trim().length >= 7;
  const deliveryValid = form.method === 'pickup' || (
    form.address1.trim() !== '' && form.city.trim() !== '' && form.state.trim() !== '' &&
    (form.zone !== 'worldwide' || WORLDWIDE_COUNTRIES.includes(form.country))
  );

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

  if (settingsLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 py-32">
        <p className="text-xs tracking-luxe uppercase text-silver-dark">Loading checkout...</p>
      </div>
    );
  }

  if (!deliverySettings) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-32 text-center">
        <p className="font-display text-3xl text-burgundy-dark mb-4">Checkout is unavailable right now</p>
        <p className="text-sm text-burgundy-dark/70 mb-8">Delivery options are being updated. Please try again shortly.</p>
        <Link to="/cart" className="text-burgundy text-xs tracking-luxe uppercase border-b border-burgundy pb-1">
          Back to Bag
        </Link>
      </div>
    );
  }

  const settings = deliverySettings as DeliverySettings;
  const pickup = (pickupSettings ?? null) as PickupSettings | null;
  const deliveryFee = form.method === 'pickup' ? 0 : quoteDelivery(settings, 'doorstep', form.zone, cartSubtotal);
  const amountDueNow = cartSubtotal + (deliveryFee ?? 0);
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handlePay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await callFunction<{ order_number: string; paystack_reference: string }>('create-order', {
        customer: { name: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() },
        delivery: {
          method: form.method,
          zone: form.method === 'doorstep' ? form.zone : null,
          address: form.method === 'doorstep'
            ? {
                line1: form.address1.trim(),
                line2: form.address2.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                country: form.zone === 'worldwide' ? form.country : 'Nigeria',
              }
            : null,
        },
        items: cart.map((item) => ({
          product_id: item.product.id,
          size: item.size,
          colour: item.colour,
          quantity: item.quantity,
        })),
        notes: form.notes.trim(),
      });

      if (typeof created.order_number !== 'string' || typeof created.paystack_reference !== 'string') {
        throw new Error('Unexpected response from the server. Please try again.');
      }

      let authorizationUrl: string;
      try {
        const started = await callFunction<{ authorization_url: string }>('start-payment', {
          order_number: created.order_number,
          reference: created.paystack_reference,
          callback_url: `${window.location.origin}${window.location.pathname}`,
        });
        authorizationUrl = started.authorization_url;
      } catch (paymentErr) {
        const message = paymentErr instanceof Error ? paymentErr.message : 'Payment could not be started.';
        throw new Error(`Your order ${created.order_number} was saved, but payment could not start: ${message} Please contact us on WhatsApp to complete payment.`);
      }

      clearCart();
      window.location.href = authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

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
          <div>
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    i <= stepIndex ? 'bg-burgundy text-cream' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] tracking-luxe uppercase ${step === s.key ? 'text-burgundy' : 'text-silver-dark'}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
                </div>
              ))}
            </div>

            {step === 'information' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="font-display text-2xl text-burgundy-dark mb-4">Contact Information</h2>
                <CheckoutInput label="Full Name" value={form.fullName} onChange={(v) => updateForm('fullName', v)} required autoComplete="name" />
                <CheckoutInput label="Email Address" type="email" value={form.email} onChange={(v) => updateForm('email', v)} required autoComplete="email" placeholder="You will receive your confirmation here" />
                <CheckoutInput label="Phone Number" value={form.phone} onChange={(v) => updateForm('phone', v)} type="tel" required autoComplete="tel" placeholder="e.g. 0801 234 5678" />
                <button
                  type="button"
                  onClick={() => setStep('delivery')}
                  disabled={!informationValid}
                  className="w-full bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                >
                  Continue to Delivery
                </button>
              </div>
            )}

            {step === 'delivery' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display text-2xl text-burgundy-dark">Delivery Method</h2>
                <DeliveryChoice
                  form={form}
                  onChange={updateForm}
                  settings={settings}
                  pickup={pickup}
                  subtotal={cartSubtotal}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('information')}
                    className="flex-1 border border-burgundy text-burgundy py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    disabled={!deliveryValid}
                    className="flex-1 bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Review & Pay
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display text-2xl text-burgundy-dark">Secure Payment</h2>

                <div className="border border-burgundy/20 p-6 bg-cream/50 space-y-3 text-sm text-burgundy-dark/80">
                  <p className="font-medium text-burgundy-dark">{form.fullName}</p>
                  <p>{form.email} · {form.phone}</p>
                  <p>
                    {form.method === 'pickup'
                      ? `Self-pickup: ${pickup?.location_name || 'SILVER LEAGUE Park Location'}`
                      : `Doorstep delivery: ${form.address1}${form.address2 ? `, ${form.address2}` : ''}, ${form.city}, ${form.state}, ${form.zone === 'worldwide' ? form.country : 'Nigeria'}`}
                  </p>
                  {form.zone === 'worldwide' && form.method === 'doorstep' && (
                    <p className="text-xs text-silver-dark">
                      Worldwide shipping is confirmed by our team after your order. Your card payment covers your items and any confirmed delivery fee.
                    </p>
                  )}
                </div>

                <div className="border border-burgundy/20 p-6 text-sm text-burgundy-dark/80">
                  <p className="flex items-center gap-2 font-medium text-burgundy-dark mb-2">
                    <Lock size={14} /> Paystack secure checkout
                  </p>
                  <p className="text-xs text-silver-dark">
                    You will be taken to Paystack to pay securely by card, bank transfer or other methods enabled for SILVER LEAGUE. Your order is confirmed only after Paystack verifies your payment.
                  </p>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 p-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    disabled={submitting}
                    className="flex-1 border border-burgundy text-burgundy py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={submitting}
                    className="flex-1 bg-burgundy text-cream py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Starting Payment...' : `Pay ${formatPrice(amountDueNow)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <OrderSummary cart={cart} subtotal={cartSubtotal} deliveryFee={deliveryFee} total={amountDueNow} />
          </div>
        </div>
      </div>
    </div>
  );
}
