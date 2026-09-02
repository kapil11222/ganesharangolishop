import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Sparkles, Copy, Check, Clock, ChevronLeft, ChevronRight, Flame, BadgePercent, Timer } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isLive, isUpcoming, isLiveOrUpcoming, occasionLabel, type OfferCampaign } from "@/lib/offers";
import { CountdownBoxes, OfferCountdownPill, countdownTarget } from "@/components/site/OfferCountdown";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { toast } from "sonner";


export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Festive Deals — Ganesha Rangoli" },
      { name: "description", content: "Live festive offers on ready-to-use rangolis: Diwali, wedding & Navratri deals, coupon codes and up to 40% off. Free shipping above ₹999." },
      { property: "og:title", content: "Offers & Festive Deals — Ganesha Rangoli" },
      { property: "og:description", content: "Live festive offers, coupon codes and discounted rangolis. Limited-time deals with pan-India delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const [occasion, setOccasion] = useState<string>("all");

  const { data: allCampaigns = [], isLoading: loadingOffers } = useQuery<OfferCampaign[]>({
    queryKey: ["offer-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("offer_campaigns").select("*").eq("is_active", true).order("display_order");
      return ((data ?? []) as OfferCampaign[]).filter(isLiveOrUpcoming);
    },
  });

  const campaigns = useMemo(() => allCampaigns.filter(isLive), [allCampaigns]);
  const upcoming = useMemo(() => allCampaigns.filter(isUpcoming), [allCampaigns]);


  const { data: products = [], isLoading: loadingProducts } = useQuery<ProductCardData[]>({
    queryKey: ["offers-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true);
      return (data ?? []) as ProductCardData[];
    },
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["active-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").eq("is_active", true)).data ?? [],
  });

  const discounted = useMemo(
    () => products.filter((p: any) => p.mrp && Number(p.mrp) > Number(p.price)),
    [products],
  );

  const occasions = useMemo(() => Array.from(new Set(campaigns.map((c) => c.occasion))), [campaigns]);

  const filtered = useMemo(() => {
    if (occasion === "all") return discounted;
    return discounted.filter((p: any) => (p.festival ?? "").toLowerCase().includes(occasion.replace(/-/g, " ")));
  }, [discounted, occasion]);

  const dealOfDay = campaigns.find((c) => c.ends_at) ?? campaigns[0];

  const under299 = useMemo(() => products.filter((p: any) => Number(p.price) <= 299), [products]);
  const bestSellersOnSale = useMemo(
    () => discounted.filter((p: any) => p.is_best_seller),
    [discounted],
  );
  const bigDiscounts = useMemo(
    () => discounted.filter((p: any) => (Number(p.mrp) - Number(p.price)) / Number(p.mrp) >= 0.3),
    [discounted],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Save big this season"
        title={<>Festive <span className="gradient-text">Offers</span></>}
        description="Live deals, coupon codes and limited-time festive discounts."
        crumbs={[{ to: "/offers", label: "Offers" }]}
      />

      <div className="container-luxe pb-20 space-y-12">
        {/* CAMPAIGN BANNERS */}
        {loadingOffers ? (
          <div className="shimmer h-52 rounded-3xl" />
        ) : campaigns.length > 0 ? (
          <OfferCarousel campaigns={campaigns} />
        ) : null}

        {/* UPCOMING OFFERS */}
        {upcoming.length > 0 && (
          <section>
            <SectionHead icon={<Timer className="size-5" />} title={<>Offers <span className="gradient-text">starting soon</span></>} sub="Get ready — these deals go live shortly." />
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.map((c) => <UpcomingCard key={c.id} campaign={c} />)}
            </div>
          </section>
        )}

        {/* DEAL OF THE DAY */}
        {dealOfDay?.ends_at && <DealOfTheDay campaign={dealOfDay} />}


        {/* COUPONS */}
        {coupons.length > 0 && (
          <section>
            <SectionHead icon={<BadgePercent className="size-5" />} title={<>Coupons <span className="gradient-text">for you</span></>} sub="Tap to copy — apply at checkout." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c: any) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          </section>
        )}

        {/* OCCASION FILTER */}
        {occasions.length > 0 && (
          <section>
            <SectionHead icon={<Sparkles className="size-5" />} title={<>Shop by <span className="gradient-text">occasion</span></>} sub="Offers curated for every celebration." />
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {["all", ...occasions].map((o) => (
                <button
                  key={o}
                  onClick={() => setOccasion(o)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition ${
                    occasion === o
                      ? "gradient-festive text-primary-foreground border-transparent shadow-glow"
                      : "bg-background/70 border-border hover:border-primary"
                  }`}
                >
                  {o === "all" ? "All Offers" : occasionLabel(o)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* PRODUCT-WISE CAMPAIGN RAILS */}
        {campaigns
          .filter((c) => (c.product_ids?.length ?? 0) > 0)
          .map((c) => {
            const ids = new Set(c.product_ids ?? []);
            const items = products.filter((p: any) => ids.has(p.id));
            return <Rail key={c.id} title={`${c.name}${c.badge_text ? ` — ${c.badge_text}` : ""}`} items={items} emoji="🎯" />;
          })}

        {/* RAILS */}
        <Rail title="Deals Under ₹299" items={under299} emoji="💸" />
        <Rail title="30% Off & More" items={bigDiscounts} emoji="🔥" />
        <Rail title="Best Sellers on Sale" items={bestSellersOnSale} emoji="⭐" />


        {/* ALL DISCOUNTED */}
        <section>
          <SectionHead icon={<Tag className="size-5" />} title={<>All discounted <span className="gradient-text">Rangolis</span></>} sub={`${filtered.length} products on offer`} />
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer aspect-[3/4] rounded-3xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <p className="text-muted-foreground">No offers in this category right now. Check back soon!</p>
              <Link to="/shop"><Button className="mt-5 rounded-full gradient-festive border-0">Browse all rangolis</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}

function SectionHead({ icon, title, sub }: { icon?: React.ReactNode; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs uppercase tracking-[0.25em] font-semibold">Offers</span></div>
      <h2 className="font-display text-2xl md:text-4xl font-bold mt-1">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function OfferCarousel({ campaigns }: { campaigns: OfferCampaign[] }) {
  const [i, setI] = useState(0);
  const count = campaigns.length;
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);
  const c = campaigns[i % count];
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-luxe border border-border bg-muted">
      <div className="relative aspect-[16/8] sm:aspect-[16/6]">
        {c.banner_url ? (
          <img src={c.banner_url} alt={c.name} className="absolute inset-0 size-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="absolute inset-0 gradient-festive opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-5 sm:px-10 max-w-xl">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 border border-border px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary">
              <Flame className="size-3" /> {occasionLabel(c.occasion)}
            </span>
            <OfferCountdownPill campaign={c} className="ml-2 align-middle" />

            <h3 className="mt-3 font-display text-2xl sm:text-4xl font-bold">{c.name}</h3>
            {c.badge_text && <div className="mt-1 font-display text-lg sm:text-2xl gradient-text font-bold">{c.badge_text}</div>}
            {c.description && <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
            <Link to={(c.cta_link || "/shop") as never}>
              <Button className="mt-4 rounded-full gradient-festive border-0 shadow-glow font-semibold">Shop this offer</Button>
            </Link>
          </div>
        </div>
      </div>
      {count > 1 && (
        <>
          <button aria-label="Previous offer" onClick={() => setI((x) => (x - 1 + count) % count)} className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-background/80 border border-border"><ChevronLeft className="size-4" /></button>
          <button aria-label="Next offer" onClick={() => setI((x) => (x + 1) % count)} className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-background/80 border border-border"><ChevronRight className="size-4" /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {campaigns.map((s, idx) => (
              <button key={s.id} aria-label={`Offer ${idx + 1}`} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 gradient-festive" : "w-2 bg-foreground/25"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UpcomingCard({ campaign }: { campaign: OfferCampaign }) {
  const { at } = countdownTarget(campaign);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-3xl p-5 shadow-card space-y-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">
          <Timer className="size-3" /> {occasionLabel(campaign.occasion)}
        </span>
        <OfferCountdownPill campaign={campaign} />
      </div>
      <h3 className="font-display text-xl md:text-2xl font-bold">{campaign.name}</h3>
      {campaign.badge_text && <div className="gradient-text font-display text-lg font-bold">{campaign.badge_text}</div>}
      {campaign.description && <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>}
      {campaign.video_url && (
        <VideoPlayer url={campaign.video_url} type={campaign.video_type} className="rounded-2xl overflow-hidden" />
      )}
      <CountdownBoxes target={at} />
      {campaign.coupon_code && (
        <div className="text-sm text-muted-foreground">
          Code <span className="font-mono font-bold text-primary">{campaign.coupon_code}</span> works once it goes live
        </div>
      )}
    </motion.div>
  );
}

function DealOfTheDay({ campaign }: { campaign: OfferCampaign }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe flex flex-col md:flex-row md:items-center gap-6"
    >
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary">
          <Clock className="size-4" /> Deal of the day
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-bold mt-2">{campaign.name}</h3>
        {campaign.badge_text && <div className="gradient-text font-display text-xl font-bold mt-1">{campaign.badge_text}</div>}
        {campaign.coupon_code && (
          <div className="text-sm text-muted-foreground mt-2">Use code <span className="font-mono font-bold text-primary">{campaign.coupon_code}</span> at checkout</div>
        )}
      </div>
      <CountdownBoxes target={campaign.ends_at} />
    </motion.section>
  );
}


function CouponCard({ coupon }: { coupon: any }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(`Code ${coupon.code} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the code");
    }
  };
  return (
    <div className="glass rounded-3xl p-5 shadow-card flex items-center gap-4 relative overflow-hidden">
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 size-8 rounded-full bg-background border border-border" />
      <div className="size-12 rounded-full gradient-festive grid place-items-center text-primary-foreground shrink-0">
        <Sparkles className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-xl font-bold truncate">{coupon.code}</div>
        <div className="text-xs text-muted-foreground">
          {coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} flat off`}
          {coupon.min_order_value ? ` · above ₹${coupon.min_order_value}` : ""}
        </div>
      </div>
      <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={copy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}

function Rail({ title, items, emoji }: { title: string; items: ProductCardData[]; emoji: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;
  const scrollBy = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl md:text-2xl font-bold">{emoji} {title}</h2>
        <div className="hidden md:flex gap-2">
          <Button size="icon" variant="outline" className="rounded-full" aria-label="Scroll left" onClick={() => scrollBy(-400)}><ChevronLeft className="size-4" /></Button>
          <Button size="icon" variant="outline" className="rounded-full" aria-label="Scroll right" onClick={() => scrollBy(400)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-3 snap-x scroll-smooth">
        {items.slice(0, 12).map((p, i) => (
          <div key={p.id} className="w-[46%] sm:w-[240px] shrink-0 snap-start">
            <ProductCard p={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
