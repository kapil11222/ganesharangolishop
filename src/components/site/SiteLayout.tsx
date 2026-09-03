import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { ScrollToTop } from "./ScrollToTop";
import { OfferStrip } from "./OfferStrip";
import { SaleModeBar } from "./SaleModeBar";
import type { ReactNode } from "react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      <Navbar />
      <SaleModeBar />
      <OfferStrip />
      <main className="flex-1">{children}</main>

      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
}
