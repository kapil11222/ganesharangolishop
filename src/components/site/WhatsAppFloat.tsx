import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/919209063985?text=Hi%20Ganesha%20Rangoli%2C%20I%27d%20like%20to%20know%20more%21"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <div className="relative size-14 rounded-full bg-[#25D366] grid place-items-center shadow-luxe group-hover:scale-110 transition-transform">
          <MessageCircle className="size-7 text-white fill-white" />
        </div>
      </div>
    </a>
  );
}
