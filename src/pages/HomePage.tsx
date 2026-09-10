import { Link } from '@/lib/router';
import { useProducts, useCollections, useSiteContent, useServices, useTestimonials, usePortfolioItems } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Instagram, Quote } from 'lucide-react';

const editorialImages = [
  'https://images.pexels.com/photos/14048053/pexels-photo-14048053.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
  'https://images.pexels.com/photos/38290951/pexels-photo-38290951.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
  'https://images.pexels.com/photos/35733628/pexels-photo-35733628.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
];

const instagramImages = [
  'https://images.pexels.com/photos/38290945/pexels-photo-38290945.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'https://images.pexels.com/photos/10356436/pexels-photo-10356436.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'https://images.pexels.com/photos/29898864/pexels-photo-29898864.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'https://images.pexels.com/photos/37571806/pexels-photo-37571806.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'https://images.pexels.com/photos/16980089/pexels-photo-16980089.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'https://images.pexels.com/photos/35339080/pexels-photo-35339080.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
];

const defaultHero = {
  heading: 'WEAR YOUR\nPOWER.',
  subtext: 'The Autumn / Winter 2026 Collection',
  image: 'https://images.pexels.com/photos/15666879/pexels-photo-15666879.jpeg?auto=compress&cs=tinysrgb&h=1600&w=2400',
  buttonText: 'Shop New Arrivals',
  buttonLink: '/shop',
};

export function HomePage() {
  const { products: newArrivals, loading } = useProducts({ isNew: true, sort: 'newest' });
  const { products: featured } = useProducts({ isFeatured: true });
  const { collections } = useCollections();
  const featuredCollection = collections.find((c) => c.is_featured) || collections[0];
  const { data: heroData } = useSiteContent('hero');
  const { services } = useServices();
  const { testimonials } = useTestimonials();
  const { items: portfolioItems } = usePortfolioItems();
  const { data: portfolioContent } = useSiteContent('portfolio');

  const hero = heroData ? { ...defaultHero, ...heroData } : defaultHero;
  const portfolioHeading = portfolioContent?.heading || 'Portfolio';
  const portfolioSubtitle = portfolioContent?.subtitle || 'Selected projects and collaborations';

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
        <img
          src={hero.image || defaultHero.image}
          alt="SILVER LEAGUE — Wear Your Power"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] md:text-xs tracking-wider-luxe uppercase text-cream/80 mb-6 animate-fade-in" style={{ animationDelay: '200ms', opacity: 0 }}>
            {hero.subtext}
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
            {hero.heading.split('\n').map((line: string, i: number) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h1>
          <Link
            to={hero.buttonLink || '/shop'}
            className="group inline-flex items-center gap-3 bg-cream text-burgundy-dark px-8 md:px-10 py-4 text-xs tracking-luxe uppercase hover:bg-white transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: '700ms', opacity: 0 }}
          >
            {hero.buttonText}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1s', opacity: 0 }}>
          <div className="w-px h-12 bg-cream/50" />
        </div>
      </section>

      {/* Featured Collection */}
      {featuredCollection && (
        <section className="py-20 md:py-32 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="relative aspect-[4/5] overflow-hidden bg-cream order-2 md:order-1">
                <img
                  src={featuredCollection.cover_image || ''}
                  alt={featuredCollection.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="order-1 md:order-2 text-center md:text-left">
                <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Featured Collection</p>
                <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark mb-6">{featuredCollection.name}</h2>
                <p className="text-burgundy-dark/70 text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                  {featuredCollection.description}
                </p>
                <Link
                  to={`/collections/${featuredCollection.slug}`}
                  className="inline-flex items-center gap-3 border-burgundy border text-burgundy px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-all duration-300"
                >
                  Explore Collection
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-cream">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">Just Arrived</p>
            <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark">New Arrivals</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-cream-dark animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {newArrivals.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 text-burgundy text-xs tracking-luxe uppercase border-b border-burgundy pb-1 hover:gap-4 transition-all"
            >
              View All Products
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="py-20 md:py-28 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">What We Offer</p>
              <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark">Services</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((s) => (
                <div key={s.id} className="text-center">
                  {s.image && (
                    <div className="aspect-[4/3] overflow-hidden bg-cream mb-6">
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <h3 className="font-display text-2xl text-burgundy-dark mb-3">{s.title}</h3>
                  <p className="text-burgundy-dark/60 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Editorial Section */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">The Editorial</p>
            <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark">The SILVER LEAGUE Woman</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {editorialImages.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden bg-cream ${i === 1 ? 'md:mt-16' : ''}`}
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={img}
                  alt={`Editorial ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-cream">
                  <p className="text-[10px] tracking-luxe uppercase mb-2 opacity-80">
                    {['Power', 'Elegance', 'Authority'][i]}
                  </p>
                  <p className="font-display text-lg leading-snug">
                    {[
                      'Tailoring that commands attention without saying a word.',
                      'The art of feminine strength, redefined.',
                      'Every piece a declaration of intent.',
                    ][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-cream py-20 md:py-28 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">Kind Words</p>
              <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark">What Our Clients Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white p-8 border border-gray-100">
                  <Quote size={28} className="text-burgundy/30 mb-4" />
                  <p className="text-burgundy-dark/70 text-sm leading-relaxed italic mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    {t.image ? (
                      <img src={t.image} alt={t.customer_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                        <span className="font-display text-sm text-burgundy">{t.customer_name.charAt(0)}</span>
                      </div>
                    )}
                    <p className="font-display text-sm text-burgundy-dark">{t.customer_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolioItems.length > 0 && (
        <section className="py-20 md:py-28 px-4 md:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">Our Work</p>
              <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark">{portfolioHeading}</h2>
              <p className="text-burgundy-dark/60 text-sm mt-3">{portfolioSubtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {portfolioItems.map((item) => (
                <div key={item.id} className="group">
                  {item.image && (
                    <div className="aspect-[4/5] overflow-hidden bg-cream mb-4">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <h3 className="font-display text-xl text-burgundy-dark mb-2">{item.title}</h3>
                  {item.description && <p className="text-burgundy-dark/60 text-sm leading-relaxed">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="bg-burgundy-dark text-cream py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-wider-luxe uppercase text-silver mb-6">The SILVER LEAGUE Story</p>
          <h2 className="font-display text-3xl md:text-5xl mb-8 leading-tight">
            For the Woman Who Leads
          </h2>
          <div className="space-y-6 text-cream/80 text-base leading-relaxed">
            <p>
              SILVER LEAGUE was born from a singular conviction: that clothing is not merely adornment, but armour. 
              Every seam, every silhouette, every fabric is chosen for the woman who walks into a room and changes its temperature.
            </p>
            <p>
              We create ready-to-wear pieces that carry the weight of couture craftsmanship — tailored, intentional, 
              and unapologetically powerful. Our collections are not seasonal trends. They are statements of identity.
            </p>
            <p>
              This is not fashion for the faint-hearted. This is SILVER LEAGUE.
            </p>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-3 mt-10 border border-cream/40 text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-cream hover:text-burgundy-dark transition-all duration-300"
          >
            Discover Our Story
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Instagram / TikTok Section */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">Follow the Movement</p>
            <h2 className="font-display text-4xl md:text-5xl text-burgundy-dark mb-4">@silverleague_co</h2>
            <a
              href="https://instagram.com/silverleague_co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-burgundy text-sm hover:opacity-60 transition-opacity"
            >
              <Instagram size={16} /> Follow on Instagram
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {instagramImages.map((img, i) => (
              <a
                key={i}
                href="https://instagram.com/silverleague_co"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden bg-cream group"
              >
                <img
                  src={img}
                  alt={`Instagram ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-burgundy/0 group-hover:bg-burgundy/30 transition-colors duration-300 flex items-center justify-center">
                  <Instagram size={24} className="text-cream opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
