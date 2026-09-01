import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Star, Quote } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { HeroSlider } from "@/components/site/HeroSlider";
import { OfferBlocks } from "@/components/site/OfferBlocks";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ganesha Rangoli — Premium Ready-to-Use Rangolis for Every Festival" },
      { name: "description", content: "Hand-crafted, reusable rangolis for Diwali, weddings & every Indian festival. Free shipping above ₹999. Cash on Delivery available." },
      { property: "og:title", content: "Ganesha Rangoli — Premium Ready-to-Use Rangolis for Every Festival" },
      { property: "og:description", content: "Hand-crafted, reusable rangolis for Diwali, weddings & every Indian festival. Free shipping above ₹999. Cash on Delivery available." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1604595287233-3da3fb05fc15?w=1200" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured = [] } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(8);
      return (data ?? []) as ProductCardData[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["home-cats"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("display_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      {/* HERO — Admin-managed banner slider (full-bleed premium) */}
      <HeroSlider />

      {/* SITEWIDE OFFER BLOCKS */}
      <div className="pt-14 md:pt-20">
        <OfferBlocks title="Festive offers live now" subtitle="Occasion-based campaigns, coupons & video drops." />
      </div>

      {/* STATS */}

      <section className="border-y border-border bg-card/40 backdrop-blur">
        <div className="container-luxe py-10 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-bold gradient-text">
              <AnimatedCounter to={20} suffix="+" />
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Designs</div>
          </div>
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-bold gradient-text">4.2</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Rating on Meesho</div>
          </div>
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-bold gradient-text">4.8</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">Rating on Our Website</div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-luxe py-20 md:py-28">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">Shop by occasion</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Curated <span className="gradient-text">Collections</span></h2>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.slice(0, 6).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to="/categories/$slug" params={{ slug: c.slug }} className="group block">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card hover:shadow-luxe transition-all">
                  <img src={c.image_url ?? ""} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                      Explore <ArrowRight className="size-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-luxe pb-20 md:pb-28">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">Designer favourites</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Featured <span className="gradient-text">Rangolis</span></h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">
            Shop all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container-luxe pb-20 md:pb-28">
        <div className="rounded-3xl glass-strong p-8 md:p-14 shadow-luxe relative overflow-hidden">
          <div className="absolute -top-32 -left-32 size-96 rounded-full gradient-festive opacity-10 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">Why Ganesha Rangoli</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold max-w-2xl">Hand-crafted luxury, <span className="gradient-text">festival after festival</span></h2>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                { icon: "🪔", t: "Premium Quality", d: "Velvet base, hand-finished detailing, festival-ready every single time." },
                { icon: "♻️", t: "Reusable", d: "Use across festivals, weddings & celebrations. Easy to clean, easy to store." },
                { icon: "🚚", t: "Fast Delivery", d: "Dispatched within 24 hours. Free shipping pan-India on orders above ₹999." },
                { icon: "🎨", t: "Custom Designs", d: "Bring us your idea — we craft bespoke rangolis for weddings & corporate events." },
                { icon: "🛡️", t: "100% Secure", d: "Encrypted checkout, COD available, easy returns within 7 days." },
                { icon: "💬", t: "Real Support", d: "Talk to humans — WhatsApp, call or email. We respond fast." },
              ].map((b, i) => (
                <motion.div
                  key={b.t}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-background/40 hover:bg-background/70 transition-colors border border-border"
                >
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-display text-xl font-bold">{b.t}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{b.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-luxe pb-20 md:pb-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">Loved across India</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">What our <span className="gradient-text">customers</span> say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Priya S.", c: "Mumbai", t: "The peacock rangoli was stunning — looked like art in my hallway. Will reuse for years!" },
            { n: "Rohit M.", c: "Pune", t: "Ordered the wedding mandala — guests couldn't stop complimenting. Worth every rupee." },
            { n: "Anjali K.", c: "Bangalore", t: "Beautiful quality, fast delivery, and the team called to confirm. Truly premium experience." },
          ].map((r, i) => (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl glass p-7 shadow-card relative"
            >
              <Quote className="absolute top-5 right-5 size-8 text-primary/20" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="size-4 fill-secondary text-secondary" />)}
              </div>
              <p className="text-sm leading-relaxed">{r.t}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="size-10 rounded-full gradient-festive grid place-items-center font-bold text-primary-foreground">
                  {r.n[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.n}</div>
                  <div className="text-xs text-muted-foreground">{r.c}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
