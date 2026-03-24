import { MessageCircle } from "lucide-react";

const PHONE = "918754885130";

const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${PHONE}?text=Hi! I'm interested in your products.`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-[#fff] px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-transform font-medium text-sm"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-5 h-5" />
    <span className="hidden sm:inline">WhatsApp</span>
  </a>
);

export default WhatsAppButton;
