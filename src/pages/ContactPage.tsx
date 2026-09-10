import { useState } from 'react';
import { Instagram, MessageCircle, Send, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '2349010480020';
const WHATSAPP_DISPLAY = '+234 901 048 0020';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hello SILVER LEAGUE, my name is ${form.name}.\nSubject: ${form.subject}\n\n${form.message}\n\nMy phone: ${form.phone}`;
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
    setSent(true);
    setForm({ name: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-16 md:py-24 px-4 md:px-8 text-center">
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">Get in Touch</p>
        <h1 className="font-display text-4xl md:text-6xl text-burgundy-dark mb-4">Contact Us</h1>
        <p className="text-burgundy-dark/60 text-sm max-w-xl mx-auto">
          For inquiries, personal styling, or private appointments, our team is at your service.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
        {/* WhatsApp banner */}
        <div className="bg-burgundy text-cream p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MessageCircle size={32} className="flex-shrink-0" />
            <div>
              <p className="text-[10px] tracking-luxe uppercase text-cream/70 mb-1">Fastest Response</p>
              <p className="font-display text-xl md:text-2xl">Chat with us on WhatsApp</p>
              <p className="text-sm text-cream/80 mt-1">{WHATSAPP_DISPLAY}</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cream text-burgundy-dark px-8 py-4 text-xs tracking-luxe uppercase hover:bg-white transition-colors whitespace-nowrap"
          >
            Start a Chat
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Form */}
          <div>
            <h2 className="font-display text-2xl text-burgundy-dark mb-6">Send a Message</h2>
            {sent && (
              <div className="bg-burgundy text-cream p-4 mb-6 text-sm animate-fade-in">
                Thank you for reaching out. Your message has been opened in WhatsApp — please send it to complete.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors"
                    placeholder="e.g. 0801 234 5678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm text-burgundy-dark outline-none focus:border-burgundy transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-3 bg-burgundy text-cream px-8 py-4 text-xs tracking-luxe uppercase hover:bg-burgundy-dark transition-colors"
              >
                <MessageCircle size={14} /> Send via WhatsApp
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div>
            <h2 className="font-display text-2xl text-burgundy-dark mb-6">Connect With Us</h2>
            <div className="space-y-6">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-12 h-12 border border-burgundy/20 flex items-center justify-center flex-shrink-0 group-hover:border-burgundy transition-colors">
                  <MessageCircle size={18} className="text-burgundy" />
                </div>
                <div>
                  <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">WhatsApp</p>
                  <p className="text-sm text-burgundy-dark group-hover:text-burgundy transition-colors">{WHATSAPP_DISPLAY}</p>
                </div>
              </a>

              <a href="https://instagram.com/silverleague_co" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-12 h-12 border border-burgundy/20 flex items-center justify-center flex-shrink-0 group-hover:border-burgundy transition-colors">
                  <Instagram size={18} className="text-burgundy" />
                </div>
                <div>
                  <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">Instagram</p>
                  <p className="text-sm text-burgundy-dark group-hover:text-burgundy transition-colors">@silverleague_co</p>
                </div>
              </a>

              <a href="https://tiktok.com/@silver_league" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-12 h-12 border border-burgundy/20 flex items-center justify-center flex-shrink-0 group-hover:border-burgundy transition-colors">
                  <span className="text-burgundy text-xs font-bold">TT</span>
                </div>
                <div>
                  <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">TikTok</p>
                  <p className="text-sm text-burgundy-dark group-hover:text-burgundy transition-colors">@silver_league</p>
                </div>
              </a>

              <a href="mailto:hello@silverleague.co" className="flex items-start gap-4 group">
                <div className="w-12 h-12 border border-burgundy/20 flex items-center justify-center flex-shrink-0 group-hover:border-burgundy transition-colors">
                  <Mail size={18} className="text-burgundy" />
                </div>
                <div>
                  <p className="text-[10px] tracking-luxe uppercase text-silver-dark mb-1">Email</p>
                  <p className="text-sm text-burgundy-dark group-hover:text-burgundy transition-colors">hello@silverleague.co</p>
                </div>
              </a>
            </div>

            <div className="mt-12 p-6 bg-cream">
              <h3 className="font-display text-lg text-burgundy-dark mb-2">Client Care Hours</h3>
              <p className="text-sm text-burgundy-dark/60">Monday — Friday: 9am to 6pm (WAT)</p>
              <p className="text-sm text-burgundy-dark/60">Saturday: 10am to 4pm (WAT)</p>
              <p className="text-xs text-silver-dark mt-3">We respond within 24 hours on WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
