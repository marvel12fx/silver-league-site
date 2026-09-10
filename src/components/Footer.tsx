import { useState } from 'react';
import { Link } from '@/lib/router';
import { LogoMark } from '@/components/Logo';
import { Instagram, MessageCircle, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-burgundy-dark text-cream">
      {/* Newsletter */}
      <div className="border-b border-burgundy-light/30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[10px] tracking-wider-luxe uppercase text-silver mb-4">Join the League</p>
            <h3 className="font-display text-3xl md:text-4xl mb-4">Be the First to Know</h3>
            <p className="text-silver text-sm mb-8 leading-relaxed">
              Subscribe for exclusive access to new collections, private events, and editorial content from SILVER LEAGUE.
            </p>
            <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-burgundy-light/40 px-5 py-3.5 text-sm text-cream placeholder:text-silver/60 outline-none focus:border-cream transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-cream text-burgundy-dark px-6 py-3.5 text-xs tracking-luxe uppercase hover:bg-white transition-colors flex items-center gap-2"
              >
                {subscribed ? 'Welcome' : 'Subscribe'}
                {!subscribed && <ArrowRight size={14} />}
              </button>
            </form>
            {subscribed && (
              <p className="text-silver text-xs mt-3 animate-fade-in">Thank you for joining SILVER LEAGUE.</p>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h4 className="text-[10px] tracking-wider-luxe uppercase text-silver mb-5">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-sm text-cream/80 hover:text-cream transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=dresses" className="text-sm text-cream/80 hover:text-cream transition-colors">Dresses</Link></li>
              <li><Link to="/shop?category=blazers" className="text-sm text-cream/80 hover:text-cream transition-colors">Blazers</Link></li>
              <li><Link to="/shop?category=outerwear" className="text-sm text-cream/80 hover:text-cream transition-colors">Outerwear</Link></li>
              <li><Link to="/shop?category=tops" className="text-sm text-cream/80 hover:text-cream transition-colors">Tops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-wider-luxe uppercase text-silver mb-5">Maison</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-cream/80 hover:text-cream transition-colors">About Us</Link></li>
              <li><Link to="/collections" className="text-sm text-cream/80 hover:text-cream transition-colors">Collections</Link></li>
              <li><Link to="/contact" className="text-sm text-cream/80 hover:text-cream transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="text-sm text-cream/80 hover:text-cream transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-wider-luxe uppercase text-silver mb-5">Client Care</h4>
            <ul className="space-y-3">
              <li><Link to="/shipping" className="text-sm text-cream/80 hover:text-cream transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="text-sm text-cream/80 hover:text-cream transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/privacy" className="text-sm text-cream/80 hover:text-cream transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-cream/80 hover:text-cream transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-wider-luxe uppercase text-silver mb-5">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://instagram.com/silverleague_co" target="_blank" rel="noopener noreferrer" className="text-sm text-cream/80 hover:text-cream transition-colors flex items-center gap-2">
                  <Instagram size={14} /> @silverleague_co
                </a>
              </li>
              <li>
                <a href="https://tiktok.com/@silver_league" target="_blank" rel="noopener noreferrer" className="text-sm text-cream/80 hover:text-cream transition-colors">
                  TikTok @silver_league
                </a>
              </li>
              <li>
                <a href="https://wa.me/2349010480020" target="_blank" rel="noopener noreferrer" className="text-sm text-cream/80 hover:text-cream transition-colors flex items-center gap-2">
                  <MessageCircle size={14} /> +234 901 048 0020
                </a>
              </li>
              <li>
                <a href="mailto:hello@silverleague.co" className="text-sm text-cream/80 hover:text-cream transition-colors flex items-center gap-2">
                  <Mail size={14} /> hello@silverleague.co
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-burgundy-light/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="text-cream">
            <LogoMark color="#F7F3EF" />
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-[10px] tracking-luxe uppercase text-silver">silverleague.co</p>
            <p className="text-[10px] tracking-luxe uppercase text-silver/60">© 2026 Silver League. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
