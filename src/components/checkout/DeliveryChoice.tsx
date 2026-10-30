import { formatPrice } from '@/lib/utils';
import { quoteDelivery, DeliverySettings, PickupSettings, DeliveryZone } from '@/lib/delivery';
import type { CheckoutForm } from '@/lib/types';
import { CheckoutInput, CheckoutOptionCard } from '@/components/checkout/CheckoutFields';

export const WORLDWIDE_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'United Arab Emirates',
  'Ghana',
  'South Africa',
  'Other',
];

interface DeliveryChoiceProps {
  form: CheckoutForm;
  onChange: <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => void;
  settings: DeliverySettings;
  pickup: PickupSettings | null;
  subtotal: number;
}

function feeLabel(fee: number | null) {
  if (fee === null) return 'To be confirmed';
  return fee === 0 ? 'Free' : formatPrice(fee);
}

export function DeliveryChoice({ form, onChange, settings, pickup, subtotal }: DeliveryChoiceProps) {
  const qualifiesFree = subtotal >= settings.free_delivery_threshold;

  const selectZone = (zone: DeliveryZone) => {
    onChange('zone', zone);
    if (zone === 'worldwide') {
      if (form.country === 'Nigeria') onChange('country', WORLDWIDE_COUNTRIES[0]);
    } else {
      onChange('country', 'Nigeria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] tracking-luxe uppercase text-silver-dark">How would you like to receive your order?</p>
        <CheckoutOptionCard
          title="Doorstep Delivery"
          description="Delivered to your address"
          meta={null}
          selected={form.method === 'doorstep'}
          onSelect={() => onChange('method', 'doorstep')}
        />
        <CheckoutOptionCard
          title="Self-Pickup"
          description="Collect from our Park location. No delivery fee."
          meta={<span>Free</span>}
          selected={form.method === 'pickup'}
          onSelect={() => onChange('method', 'pickup')}
        />
      </div>

      {form.method === 'doorstep' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-3">
            <p className="text-[10px] tracking-luxe uppercase text-silver-dark">Delivery zone</p>
            <CheckoutOptionCard
              title="Lagos"
              description={`Estimated ${settings.lagos_eta}`}
              meta={feeLabel(quoteDelivery(settings, 'doorstep', 'lagos', subtotal))}
              selected={form.zone === 'lagos'}
              onSelect={() => selectZone('lagos')}
            />
            <CheckoutOptionCard
              title="Other Nigerian Locations"
              description={`Estimated ${settings.nigeria_eta}`}
              meta={feeLabel(quoteDelivery(settings, 'doorstep', 'nigeria', subtotal))}
              selected={form.zone === 'nigeria'}
              onSelect={() => selectZone('nigeria')}
            />
            <CheckoutOptionCard
              title="Worldwide"
              description={`Estimated ${settings.worldwide_eta}. Shipping confirmed by our team.`}
              meta={feeLabel(null)}
              selected={form.zone === 'worldwide'}
              onSelect={() => selectZone('worldwide')}
            />
          </div>

          {qualifiesFree && form.zone !== 'worldwide' ? (
            <p className="text-xs text-burgundy bg-cream p-3">
              Your order qualifies for free delivery within Nigeria.
            </p>
          ) : form.zone !== 'worldwide' ? (
            <p className="text-xs text-burgundy-light bg-cream p-3">
              Add {formatPrice(settings.free_delivery_threshold - subtotal)} more to your order for free delivery within Nigeria.
            </p>
          ) : null}

          <CheckoutInput label="Address Line 1" value={form.address1} onChange={(v) => onChange('address1', v)} required autoComplete="address-line1" />
          <CheckoutInput label="Address Line 2 (Optional)" value={form.address2} onChange={(v) => onChange('address2', v)} autoComplete="address-line2" />
          <div className="grid grid-cols-2 gap-4">
            <CheckoutInput label="City" value={form.city} onChange={(v) => onChange('city', v)} required autoComplete="address-level2" />
            <CheckoutInput label="State / Region" value={form.state} onChange={(v) => onChange('state', v)} required autoComplete="address-level1" />
          </div>
          {form.zone === 'worldwide' ? (
            <div>
              <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Country *</label>
              <select
                value={form.country}
                onChange={(e) => onChange('country', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors bg-white"
              >
                {WORLDWIDE_COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Country</label>
              <p className="w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-burgundy-dark">Nigeria</p>
            </div>
          )}
        </div>
      )}

      {form.method === 'pickup' && (
        <div className="bg-cream p-5 space-y-3 animate-fade-in">
          <p className="text-[10px] tracking-luxe uppercase text-silver-dark">Pickup details</p>
          <p className="font-display text-xl text-burgundy-dark">{pickup?.location_name || 'SILVER LEAGUE Park Location'}</p>
          {pickup?.address ? (
            <p className="text-sm text-burgundy-dark/80">{pickup.address}</p>
          ) : (
            <p className="text-sm text-burgundy-dark/80">Our team will share the exact pickup address with you on WhatsApp after you order.</p>
          )}
          {pickup?.hours && <p className="text-sm text-burgundy-dark/80">Hours: {pickup.hours}</p>}
          {pickup?.instructions && <p className="text-xs text-silver-dark">{pickup.instructions}</p>}
        </div>
      )}

      <div>
        <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Order Notes (Optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors resize-none"
          placeholder="Special delivery instructions..."
        />
      </div>
    </div>
  );
}
