import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { ScrollToTop } from "./ScrollToTop";
import { OfferStrip } from "./OfferStrip";
import type { ReactNode } from "react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      <Navbar />
      <OfferStrip />
      <main className="flex-1">{children}</main>

      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
}
