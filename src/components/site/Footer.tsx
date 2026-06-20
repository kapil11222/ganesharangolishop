import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setLoading(false);
    if (error) {
      toast.error(error.code === "23505" ? "You're already subscribed!" : "Couldn't subscribe");
    } else {
      toast.success("Welcome aboard! 🪔");
      setEmail("");
    }
  };

  return (
    <footer className="relative mt-32 border-t border-border bg-card/40 backdrop-blur">
      {/* Newsletter */}
      <div className="container-luxe pt-16 pb-12">
        <div className="rounded-3xl glass-strong p-8 md:p-12 shadow-luxe relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-72 rounded-full gradient-festive opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-secondary opacity-20 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold">
                <Sparkles className="size-3.5" /> Festive Insider
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold mt-3">
                Get <span className="gradient-text">10% off</span> your first order
              </h3>
              <p className="text-muted-foreground mt-2">
                Festival drops, designer collections & secret offers — straight to your inbox.
              </p>
            </div>
            <form onSubmit={subscribe} className="flex gap-2">
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-full px-5 bg-background/60"
              />
              <Button type="submit" disabled={loading} className="h-12 px-6 rounded-full gradient-festive border-0 shadow-glow">
                {loading ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

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
