import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { ScrollToTop } from "./ScrollToTop";
import { OfferBars } from "./SaleModeBar";
import { FestivalExperience } from "./FestivalWelcome";
import type { ReactNode } from "react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="festival-storefront min-h-screen flex flex-col gradient-hero">
      <FestivalExperience />
      <Navbar />
      <OfferBars />
      <main className="flex-1">{children}</main>


      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
}
