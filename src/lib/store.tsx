import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { CartItem, Product } from './types';
import { supabase } from './supabase';

const CART_KEY = 'sl_cart';
const WISHLIST_KEY = 'sl_wishlist';
const SESSION_KEY = 'sl_session';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number, colour?: string | null) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistLoading: boolean;

  sessionId: string;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [sessionId] = useState(getSessionId);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Load wishlist from Supabase
  const loadWishlist = useCallback(async () => {
    setWishlistLoading(true);
    const { data } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('session_id', sessionId);
    if (data) {
      setWishlist(data.map((w: { product_id: string }) => w.product_id));
    }
    setWishlistLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToCart = useCallback(
    (product: Product, size: string, quantity = 1, colour: string | null = null) => {
      setCart((prev) => {
        const existing = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            (item.colour ?? null) === (colour ?? null)
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing].quantity += quantity;
          return updated;
        }
        return [...prev, { product, colour, size, quantity }];
      });
    },
    []
  );

  const updateCartQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((_, i) => i !== index);
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (wishlist.includes(productId)) {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        await supabase
          .from('wishlist')
          .delete()
          .eq('session_id', sessionId)
          .eq('product_id', productId);
      } else {
        setWishlist((prev) => [...prev, productId]);
        await supabase
          .from('wishlist')
          .insert({ session_id: sessionId, product_id: productId });
      }
    },
    [wishlist, sessionId]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        wishlistLoading,
        sessionId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
