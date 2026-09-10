import { useCollections } from '@/lib/hooks';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';

export function CollectionsPage() {
  const { collections, loading } = useCollections();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-16 md:py-24 px-4 md:px-8 text-center">
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Curated Edit</p>
        <h1 className="font-display text-4xl md:text-6xl text-burgundy-dark mb-4">Collections</h1>
        <p className="text-burgundy-dark/60 text-sm max-w-xl mx-auto">
          Each SILVER LEAGUE collection is a chapter in the story of feminine power.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20">
        {loading ? (
          <div className="space-y-16">
            {[1, 2].map((i) => (
              <div key={i} className="h-[500px] bg-cream animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-20 md:space-y-32">
            {collections.map((collection, i) => (
              <div
                key={collection.id}
                className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-cream [direction:ltr]">
                  <Link to={`/collections/${collection.slug}`}>
                    <img
                      src={collection.cover_image || collection.editorial_image || ''}
                      alt={collection.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                    />
                  </Link>
                  {collection.is_featured && (
                    <span className="absolute top-4 left-4 bg-burgundy text-cream text-[9px] tracking-luxe uppercase px-3 py-1.5">
                      Featured
                    </span>
                  )}
                </div>
                <div className="[direction:ltr] text-center md:text-left">
                  <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">
                    Collection {String(i + 1).padStart(2, '0')}
                  </p>
                  <h2 className="font-display text-3xl md:text-5xl text-burgundy-dark mb-6">{collection.name}</h2>
                  <p className="text-burgundy-dark/70 text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                    {collection.description}
                  </p>
                  <Link
                    to={`/collections/${collection.slug}`}
                    className="inline-flex items-center gap-3 border-burgundy border text-burgundy px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy hover:text-cream transition-all duration-300"
                  >
                    Discover Collection
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
