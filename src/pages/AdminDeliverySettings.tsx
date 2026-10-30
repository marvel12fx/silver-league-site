import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { DeliverySettings, PickupSettings } from '@/lib/delivery';
import { Save } from 'lucide-react';

const inputClass = 'w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy bg-white';
const labelClass = 'block text-[10px] tracking-luxe uppercase text-silver-dark mb-2';

export function AdminDeliverySettings() {
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [pickup, setPickup] = useState<PickupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<'delivery' | 'pickup' | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('section, data')
        .in('section', ['delivery_settings', 'pickup']);
      if (error) {
        setLoadError(`Could not load settings: ${error.message}`);
      } else {
        const rows = (data ?? []) as { section: string; data: Record<string, any> }[];
        const d = rows.find((r) => r.section === 'delivery_settings')?.data;
        const p = rows.find((r) => r.section === 'pickup')?.data;
        if (!d || !p) {
          setLoadError('Delivery or pickup settings are missing from the database.');
        } else {
          setDelivery(d as DeliverySettings);
          setPickup(p as PickupSettings);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async (section: 'delivery_settings' | 'pickup', data: DeliverySettings | PickupSettings) => {
    setSaving(section === 'pickup' ? 'pickup' : 'delivery');
    setMessage(null);
    const { error } = await supabase
      .from('site_content')
      .update({ data })
      .eq('section', section)
      .select('section');
    if (error) {
      setMessage({ kind: 'error', text: `Could not save: ${error.message}` });
    } else {
      setMessage({ kind: 'ok', text: 'Saved. The storefront will show these settings from now on.' });
    }
    setSaving(null);
  };

  const setDeliveryField = (key: keyof DeliverySettings, value: string) => {
    setDelivery((prev) => {
      if (!prev) return prev;
      const numeric = key.endsWith('fee') || key === 'free_delivery_threshold';
      return { ...prev, [key]: numeric ? Number(value) || 0 : value };
    });
  };

  const setPickupField = (key: keyof PickupSettings, value: string) => {
    setPickup((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading) return <p className="text-silver-dark text-sm">Loading...</p>;
  if (loadError || !delivery || !pickup) {
    return <p className="text-sm text-red-700">{loadError ?? 'Settings unavailable.'}</p>;
  }

  return (
    <div className="max-w-3xl space-y-10">
      {message && (
        <p className={`text-sm ${message.kind === 'ok' ? 'text-green-800' : 'text-red-700'}`}>{message.text}</p>
      )}

      <section className="bg-white border border-gray-100 p-6 md:p-8 space-y-6">
        <div>
          <p className="font-display text-xl text-burgundy-dark">Doorstep delivery</p>
          <p className="text-xs text-silver-dark mt-1">Fees are applied automatically at checkout and recalculated on the server.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Lagos fee (₦)</label>
            <input type="number" min={0} value={delivery.lagos_fee} onChange={(e) => setDeliveryField('lagos_fee', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Lagos estimate</label>
            <input type="text" value={delivery.lagos_eta} onChange={(e) => setDeliveryField('lagos_eta', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Other Nigeria fee (₦)</label>
            <input type="number" min={0} value={delivery.nigeria_fee} onChange={(e) => setDeliveryField('nigeria_fee', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Other Nigeria estimate</label>
            <input type="text" value={delivery.nigeria_eta} onChange={(e) => setDeliveryField('nigeria_eta', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Worldwide estimate</label>
            <input type="text" value={delivery.worldwide_eta} onChange={(e) => setDeliveryField('worldwide_eta', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Free Nigerian delivery above (₦)</label>
            <input type="number" min={0} value={delivery.free_delivery_threshold} onChange={(e) => setDeliveryField('free_delivery_threshold', e.target.value)} className={inputClass} />
          </div>
        </div>
        <button
          onClick={() => save('delivery_settings', delivery)}
          disabled={saving !== null}
          className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-60"
        >
          <Save size={14} /> {saving === 'delivery' ? 'Saving...' : 'Save delivery settings'}
        </button>
      </section>

      <section className="bg-white border border-gray-100 p-6 md:p-8 space-y-6">
        <div>
          <p className="font-display text-xl text-burgundy-dark">Self-pickup</p>
          <p className="text-xs text-silver-dark mt-1">Shown to customers who choose to collect their order. Pickup is always free.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Location name</label>
            <input type="text" value={pickup.location_name} onChange={(e) => setPickupField('location_name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pickup hours</label>
            <input type="text" value={pickup.hours} onChange={(e) => setPickupField('hours', e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <input type="text" value={pickup.address} onChange={(e) => setPickupField('address', e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Instructions</label>
            <textarea rows={3} value={pickup.instructions} onChange={(e) => setPickupField('instructions', e.target.value)} className={inputClass} />
          </div>
        </div>
        <button
          onClick={() => save('pickup', pickup)}
          disabled={saving !== null}
          className="inline-flex items-center gap-2 bg-burgundy text-cream px-6 py-3 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors disabled:opacity-60"
        >
          <Save size={14} /> {saving === 'pickup' ? 'Saving...' : 'Save pickup details'}
        </button>
      </section>
    </div>
  );
}
