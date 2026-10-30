export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  editorial_image: string | null;
  cover_image: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
}

export interface ProductColour {
  id: string;
  product_id: string;
  name: string;
  images: string[];
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  category_id: string | null;
  collection_id: string | null;
  images: string[];
  sizes: string[];
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  categories?: Category;
  collections?: Collection;
  product_sizes?: ProductSize[];
  product_colours?: ProductColour[];
  product_videos?: ProductVideo[];
}

export interface ProductVideo {
  id: string;
  product_id: string;
  url: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  colour: string | null;
  size: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  colour: string | null;
  size: string | null;
  quantity: number;
  price: number;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'abandoned';
export type DeliveryStatus = 'not_started' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'picked_up';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  payment_status: PaymentStatus;
  paystack_reference: string | null;
  payment_amount: number | null;
  paid_at: string | null;
  delivery_method: 'pickup' | 'doorstep';
  delivery_zone: 'lagos' | 'nigeria' | 'worldwide' | null;
  delivery_fee: number;
  delivery_status: DeliveryStatus;
  pickup_location: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderSummary {
  order_number: string;
  payment_status: PaymentStatus;
  paid_at: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_method: 'pickup' | 'doorstep';
  delivery_zone: 'lagos' | 'nigeria' | 'worldwide' | null;
  delivery_status: DeliveryStatus;
  pickup_location: string | null;
  order_items: Pick<OrderItem, 'product_name' | 'colour' | 'size' | 'quantity' | 'price'>[];
}

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  method: 'pickup' | 'doorstep';
  zone: 'lagos' | 'nigeria' | 'worldwide';
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  notes: string;
}

export interface SiteContent {
  section: string;
  data: Record<string, any>;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  text: string;
  image: string | null;
  sort_order: number;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  created_at: string;
}
