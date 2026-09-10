export function formatPrice(price: number): string {
  return '\u20A6' + new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SL-${ymd}-${rand}`;
}
