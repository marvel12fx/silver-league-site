import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { LogoMark } from '@/components/Logo';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/collections' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const { route, navigate } = useRouter();
  const { cartCount, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [route.path]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isHome = route.path === '/';
  const navClass = scrolled
    ? 'bg-white/95 backdrop-blur-md shadow-sm'
    : isHome
      ? 'bg-transparent'
      : 'bg-white';

  const textColor = scrolled || !isHome ? 'text-burgundy-dark' : 'text-white';
  const iconColor = scrolled || !isHome ? 'text-burgundy-dark' : 'text-white';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${navClass}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left nav - desktop */}
            <div className="hidden lg:flex items-center gap-8 flex-1">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs tracking-luxe uppercase font-medium hover:opacity-60 transition-opacity ${textColor}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className={`lg:hidden ${iconColor}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo - center */}
            <Link to="/" className={`flex-1 flex justify-center lg:flex-none ${textColor}`}>
              <LogoMark className="text-center" color={scrolled || !isHome ? '#2E0810' : '#ffffff'} />
            </Link>

            {/* Right nav - desktop */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs tracking-luxe uppercase font-medium hover:opacity-60 transition-opacity ${textColor}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className={`flex items-center gap-5 ${iconColor}`}>
                <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" className="hover:opacity-60 transition-opacity">
                  <Search size={19} />
                </button>
                <Link to="/wishlist" className="relative hover:opacity-60 transition-opacity">
                  <Heart size={19} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-burgundy text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative hover:opacity-60 transition-opacity">
                  <ShoppingBag size={19} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-burgundy text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile icons */}
            <div className={`flex lg:hidden items-center gap-4 flex-1 justify-end ${iconColor}`}>
              <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <Search size={19} />
              </button>
              <Link to="/wishlist" className="relative">
                <Heart size={19} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-burgundy text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative">
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-burgundy text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 animate-slide-down">
            <form onSubmit={handleSearch} className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
              <div className="flex items-center gap-4 border-b border-burgundy pb-3">
                <Search size={20} className="text-burgundy" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, collections..."
                  className="flex-1 text-lg font-display outline-none bg-transparent text-burgundy-dark placeholder:text-gray-400"
                  autoFocus
                />
                <button type="submit" className="text-xs tracking-luxe uppercase text-burgundy hover:opacity-60">
                  Search
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm tracking-luxe uppercase font-medium text-burgundy-dark py-2 border-b border-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <div className="h-20" />
    </>
  );
}
