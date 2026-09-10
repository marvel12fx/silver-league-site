import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/14048053/pexels-photo-14048053.jpeg?auto=compress&cs=tinysrgb&h=1200&w=2000"
          alt="SILVER LEAGUE"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] tracking-wider-luxe uppercase text-cream/80 mb-4">The Maison</p>
          <h1 className="font-display text-4xl md:text-6xl text-white">The SILVER LEAGUE Story</h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-6">Our Philosophy</p>
          <h2 className="font-display text-3xl md:text-5xl text-burgundy-dark mb-8 leading-tight">
            Clothing as Conviction
          </h2>
          <div className="space-y-6 text-burgundy-dark/70 text-base leading-relaxed">
            <p>
              SILVER LEAGUE is a women's ready-to-wear brand built on a single, unwavering belief:
              what a woman wears should reflect who she is — and who she intends to become.
            </p>
            <p>
              Founded for the powerful, the confident, and the sophisticated, every piece in our collection
              is designed to be more than clothing. It is a declaration. A quiet armour. A statement of intent
              that does not need to raise its voice to be heard.
            </p>
            <p>
              Our atelier marries the precision of traditional tailoring with a modern editorial sensibility.
              We source the finest fabrics, cut with intention, and finish each piece with the kind of detail
              that is invisible to the casual eye but unmistakable to the woman who wears it.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-3">What We Stand For</p>
            <h2 className="font-display text-3xl md:text-5xl text-burgundy-dark">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-16">
            {[
              { title: 'Power', text: 'We design for the woman who leads. Every silhouette is engineered to project authority and confidence.' },
              { title: 'Craft', text: 'Couture-level construction in ready-to-wear. We hold every seam, every finish, every detail to the highest standard.' },
              { title: 'Exclusivity', text: 'Our pieces are not for everyone. They are for the woman who recognises quality without needing it pointed out.' },
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-5xl text-burgundy/20 mb-4">0{i + 1}</div>
                <h3 className="font-display text-2xl text-burgundy-dark mb-4">{value.title}</h3>
                <p className="text-burgundy-dark/60 text-sm leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial image */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="aspect-[4/5] overflow-hidden bg-cream">
              <img
                src="https://images.pexels.com/photos/38290951/pexels-photo-38290951.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800"
                alt="SILVER LEAGUE woman"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">The Woman</p>
              <h2 className="font-display text-3xl md:text-4xl text-burgundy-dark mb-6 leading-tight">
                She Does Not Wait to Be Invited
              </h2>
              <div className="space-y-4 text-burgundy-dark/70 text-base leading-relaxed">
                <p>
                  The SILVER LEAGUE woman is not defined by the room she enters — she defines it.
                  She is the executive, the founder, the creative force, the decision-maker.
                </p>
                <p>
                  She understands that luxury is not about logos. It is about the way a garment feels,
                  the way it moves, and the way it makes her feel: unstoppable.
                </p>
                <p>
                  We build every collection for her.
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 mt-8 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
              >
                Discover the Collection
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
