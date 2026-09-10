import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '2349010480020';

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-burgundy text-cream px-4 py-3 shadow-lg hover:bg-burgundy-dark transition-all duration-300 group"
    >
      <MessageCircle size={24} className="flex-shrink-0" />
      <span className="text-xs tracking-luxe uppercase whitespace-nowrap max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
        Chat with us
      </span>
    </a>
  );
}
