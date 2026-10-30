import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { ShoppingBag } from 'lucide-react';
import { DeliveryMethodLabel, OrderDetail, OrderStatusBadge, PaymentBadge, DELIVERY_STATUS_LABELS } from '@/components/admin/OrderDetail';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError(`Could not load orders: ${error.message}`);
    } else {
      setOrders((data as Order[]) ?? []);
      setLoadError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const updateField = async (id: string, field: 'status' | 'delivery_status', value: string) => {
    setSaving(field);
    setActionError(null);
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id);
    if (error) {
      setActionError(`Could not save the change: ${error.message}`);
    } else {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
    }
    setSaving(null);
  };

  if (selected) {
    return (
      <OrderDetail
        order={selected}
        saving={saving}
        error={actionError}
        onBack={() => {
          setSelectedId(null);
          setActionError(null);
        }}
        onUpdateField={(field, value) => updateField(selected.id, field, value)}
      />
    );
  }

  if (loading) return <p className="text-silver-dark text-sm">Loading...</p>;

  if (loadError) {
    return <p className="text-sm text-red-700">{loadError}</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-12 text-center">
        <ShoppingBag size={32} className="text-silver mx-auto mb-4" />
        <p className="text-silver-dark text-sm">No orders yet. When customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-silver-dark mb-6">{orders.length} orders</p>
      <div className="bg-white border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-[10px] tracking-luxe uppercase text-silver-dark">
            <tr>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4 hidden md:table-cell">Customer</th>
              <th className="text-left p-4 hidden lg:table-cell">Delivery</th>
              <th className="text-right p-4">Total</th>
              <th className="text-center p-4">Payment</th>
              <th className="text-center p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className="hover:bg-cream/50 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <p className="font-display text-burgundy-dark">{o.order_number}</p>
                  <p className="text-xs text-silver-dark">{new Date(o.created_at).toLocaleDateString()}</p>
                </td>
                <td className="p-4 hidden md:table-cell text-silver-dark">{o.customer_name}</td>
                <td className="p-4 hidden lg:table-cell text-silver-dark">
                  <p><DeliveryMethodLabel order={o} /></p>
                  <p className="text-xs">{DELIVERY_STATUS_LABELS[o.delivery_status] ?? o.delivery_status}</p>
                </td>
                <td className="p-4 text-right text-burgundy-dark">{formatPrice(Number(o.total))}</td>
                <td className="p-4 text-center"><PaymentBadge status={o.payment_status} /></td>
                <td className="p-4 text-center"><OrderStatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
