export interface DeliverySettings {
  lagos_fee: number;
  lagos_eta: string;
  nigeria_fee: number;
  nigeria_eta: string;
  worldwide_eta: string;
  free_delivery_threshold: number;
}

export interface PickupSettings {
  location_name: string;
  address: string;
  instructions: string;
  hours: string;
}

export type DeliveryMethod = 'pickup' | 'doorstep';
export type DeliveryZone = 'lagos' | 'nigeria' | 'worldwide';

export function quoteDelivery(
  settings: DeliverySettings,
  method: DeliveryMethod,
  zone: DeliveryZone,
  subtotal: number
): number | null {
  if (method === 'pickup') return 0;
  if (zone === 'worldwide') return null;
  if (subtotal >= settings.free_delivery_threshold) return 0;
  return zone === 'lagos' ? settings.lagos_fee : settings.nigeria_fee;
}
