import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export type HeroSlide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string;
  mobile_image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
};

const AUTOPLAY_MS = 5000;

export function HeroSlider() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const { data: slides = [], isLoading } = useQuery<HeroSlide[]>({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("hero_slides")
        .select("id,title,subtitle,eyebrow,image_url,mobile_image_url,cta_label,cta_link,starts_at,ends_at")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      return ((data ?? []) as (HeroSlide & { starts_at: string | null; ends_at: string | null })[]).filter(
        (s) => (!s.starts_at || s.starts_at <= nowIso) && (!s.ends_at || s.ends_at >= nowIso),
      );
    },
  });

  const count = slides.length;
  const go = useCallback((n: number) => setIndex((i) => (count ? (n + count) % count : 0)), [count]);

  useEffect(() => {
    if (paused || count < 2 || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count, reduce]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (isLoading) {
    return <div className="container-luxe pt-6"><div className="shimmer rounded-3xl aspect-[16/7] w-full" /></div>;
  }

  if (!count) return <HeroFallback />;

  const slide = slides[index] ?? slides[0];

  return (
    <section aria-label="Featured offers" className="relative">
      <div className="container-luxe pt-4 md:pt-6">
        <div
          className="relative overflow-hidden rounded-3xl shadow-luxe border border-border bg-muted"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
            touchX.current = null;
            setPaused(false);
          }}
        >
          <div className="relative aspect-[16/9] sm:aspect-[16/7] lg:aspect-[21/8]">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.7, ease: "easeOut" }}
              >
                <picture>
                  {slide.mobile_image_url && (
                    <source media="(max-width: 640px)" srcSet={slide.mobile_image_url} />
                  )}
                  <img
                    src={slide.image_url}
                    alt={slide.title ?? "Ganesha Rangoli offer banner"}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                    draggable={false}
                  />
                </picture>
                {(slide.title || slide.subtitle || slide.cta_label) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-transparent" />
                )}
              </motion.div>
            </AnimatePresence>

            {(slide.title || slide.subtitle || slide.cta_label) && (
              <motion.div
                key={`copy-${slide.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute inset-0 flex items-center"
              >
                <div className="px-5 sm:px-10 md:px-14 max-w-xl">
                  {slide.eyebrow && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur border border-border px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary">
                      <Sparkles className="size-3" /> {slide.eyebrow}
                    </div>
                  )}
                  {slide.title && (
                    <h1 className="mt-3 font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-tight">
                      {slide.title}
                    </h1>
                  )}
                  {slide.subtitle && (
                    <p className="mt-2 text-xs sm:text-base text-muted-foreground line-clamp-3 max-w-md">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta_label && (
                    <Link to={(slide.cta_link || "/shop") as never} className="inline-block mt-4 sm:mt-6">
                      <Button size="lg" className="rounded-full gradient-festive border-0 shadow-glow font-semibold h-10 sm:h-12 px-5 sm:px-8">
                        {slide.cta_label} <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(index - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 md:size-11 rounded-full bg-background/80 backdrop-blur border border-border shadow hover:bg-background transition"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(index + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 md:size-11 rounded-full bg-background/80 backdrop-blur border border-border shadow hover:bg-background transition"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 gradient-festive" : "w-2.5 bg-foreground/25 hover:bg-foreground/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <TrustBar />
    </section>
  );
}

function HeroFallback() {
  return (
    <section className="container-luxe pt-10 pb-4">
      <div className="rounded-3xl glass-strong shadow-luxe p-8 md:p-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium">
          <Sparkles className="size-3.5 text-secondary" /> Hand-crafted in India · 10,000+ homes
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-tight">
          Premium <span className="gradient-text">Ready-to-Use</span> Rangoli
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Reusable, easy-to-place festive rangolis for Diwali, weddings and every celebration.
        </p>
        <Link to="/shop" className="inline-block mt-7">
          <Button size="lg" className="rounded-full gradient-festive border-0 shadow-glow px-8 font-semibold">
            Shop Now <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>
      <TrustBar />
    </section>
  );
}

function TrustBar() {
  const items = [
    { i: Truck, t: "Free Shipping ₹999+", d: "Pan-India delivery" },
    { i: RefreshCw, t: "Reusable Designs", d: "Festival after festival" },
    { i: ShieldCheck, t: "Secure Checkout", d: "COD & UPI available" },
    { i: Sparkles, t: "Premium Quality", d: "Hand-finished detailing" },
  ];
  return (
    <div className="container-luxe mt-4 md:mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((x) => (
          <div key={x.t} className="flex items-center gap-3 rounded-2xl glass px-4 py-3 shadow-card">
            <span className="grid place-items-center size-9 rounded-full gradient-festive text-primary-foreground shrink-0">
              <x.i className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold truncate">{x.t}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{x.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
