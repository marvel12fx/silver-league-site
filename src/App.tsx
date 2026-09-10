import { useRouter, matchRoute } from '@/lib/router';
import { StoreProvider } from '@/lib/store';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { SearchPage } from '@/pages/SearchPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { ShippingPage, ReturnsPage, PrivacyPage, TermsPage } from '@/pages/PolicyPages';
import { AdminPage } from '@/pages/AdminPage';
import { WhatsAppButton } from '@/components/WhatsAppButton';

function AppContent() {
  const { route } = useRouter();
  const path = route.path;

  // Admin has its own layout (no navbar/footer)
  if (path === '/admin' || path.startsWith('/admin/')) {
    return <AdminPage />;
  }

  let page: React.ReactNode;

  if (path === '/') {
    page = <HomePage />;
  } else if (path === '/shop') {
    page = <ShopPage />;
  } else if (path === '/collections') {
    page = <CollectionsPage />;
  } else if (path === '/cart') {
    page = <CartPage />;
  } else if (path === '/checkout') {
    page = <CheckoutPage />;
  } else if (path === '/wishlist') {
    page = <WishlistPage />;
  } else if (path === '/search') {
    page = <SearchPage />;
  } else if (path === '/about') {
    page = <AboutPage />;
  } else if (path === '/contact') {
    page = <ContactPage />;
  } else if (path === '/shipping') {
    page = <ShippingPage />;
  } else if (path === '/returns') {
    page = <ReturnsPage />;
  } else if (path === '/privacy') {
    page = <PrivacyPage />;
  } else if (path === '/terms') {
    page = <TermsPage />;
  } else {
    const productMatch = matchRoute(path, '/product/:slug');
    const collectionMatch = matchRoute(path, '/collections/:slug');

    if (productMatch) {
      page = <ProductDetailPage slug={productMatch.slug} />;
    } else if (collectionMatch) {
      page = <CollectionDetailPage slug={collectionMatch.slug} />;
    } else {
      page = (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <p className="font-display text-5xl text-burgundy-dark mb-4">404</p>
          <p className="text-silver-dark text-sm mb-8">This page could not be found.</p>
          <a href="#/" className="bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors">
            Return Home
          </a>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{page}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
