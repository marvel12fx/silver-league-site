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

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
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
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
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
