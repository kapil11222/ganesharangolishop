import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";


const cols = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All Products" },
      { to: "/categories", label: "Categories" },
      { to: "/new-arrivals", label: "New Arrivals" },
      { to: "/best-sellers", label: "Best Sellers" },
      { to: "/festive", label: "Festive Collection" },
      { to: "/wedding", label: "Wedding Collection" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { to: "/help", label: "Help Center" },
      { to: "/track-order", label: "Track Order" },
      { to: "/faqs", label: "FAQs" },
      { to: "/contact", label: "Contact Us" },
      { to: "/bulk-orders", label: "Bulk Orders" },
      { to: "/custom-orders", label: "Custom Orders" },
    ],
  },
  {
    title: "Policies",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/refund", label: "Refund Policy" },
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/shipping", label: "Shipping Policy" },
      { to: "/about", label: "About Us" },
      { to: "/blog", label: "Blog" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border bg-card/40 backdrop-blur pt-16">


      <div className="container-luxe pb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-11 rounded-full gradient-festive grid place-items-center shadow-glow">
              <span className="font-display text-xl font-bold text-primary-foreground">ॐ</span>
            </div>
            <div>
              <div className="font-display text-xl font-bold">Ganesha Rangoli</div>
              <div className="text-[11px] text-muted-foreground tracking-widest uppercase">
                Beautiful Ready-to-Use Rangolis
              </div>
            </div>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm">
            Hand-crafted, reusable rangolis to make every festival and celebration unforgettable.
            Designed in India, loved by thousands of families.
          </p>
          <div className="space-y-2 text-sm">
            <a href="tel:+919209063985" className="flex items-center gap-2 hover:text-primary transition">
              <Phone className="size-4 text-primary" /> +91 9209063985
            </a>
            <a href="mailto:info.ganesharangoli@gmail.com" className="flex items-center gap-2 hover:text-primary transition">
              <Mail className="size-4 text-primary" /> info.ganesharangoli@gmail.com
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Maharashtra, India
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <a href="#" className="size-10 rounded-full glass grid place-items-center hover:text-primary transition" aria-label="Instagram">
              <Instagram className="size-4" />
            </a>
            <a href="#" className="size-10 rounded-full glass grid place-items-center hover:text-primary transition" aria-label="Facebook">
              <Facebook className="size-4" />
            </a>
            <a href="#" className="size-10 rounded-full glass grid place-items-center hover:text-primary transition" aria-label="YouTube">
              <Youtube className="size-4" />
            </a>
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-base font-bold mb-4">{c.title}</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-luxe py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Ganesha Rangoli. Crafted with 🪔 in India.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/shipping" className="hover:text-primary">Shipping</Link>
            <Link to="/refund" className="hover:text-primary">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
