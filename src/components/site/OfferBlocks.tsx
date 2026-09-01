import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Copy, Check, Timer, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { occasionLabel, isUpcoming, type OfferCampaign } from "@/lib/offers";
import { useLiveCampaigns } from "@/components/site/OfferStrip";
import { OfferCountdownPill } from "@/components/site/OfferCountdown";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { toast } from "sonner";


/** Scrollable campaign banner cards, injected on Home / Shop / Product pages. */
export function OfferBlocks({
  title = "Festive offers",
  subtitle = "Limited-time deals, curated for every occasion.",
  limit = 6,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}) {
  const { data: campaigns = [] } = useLiveCampaigns();
  const items = campaigns.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className={`container-luxe ${className}`} aria-label="Offers">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-[0.25em] font-semibold">
            <Flame className="size-4" /> Offers
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-bold mt-1">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Link to="/offers" className="text-sm font-semibold text-primary hover:underline">
          View all offers →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
        {items.map((c, i) => (
          <OfferBlockCard key={c.id} c={c} index={i} />
        ))}
      </div>
    </section>
  );
}

function OfferBlockCard({ c, index }: { c: OfferCampaign; index: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!c.coupon_code) return;
    try {
      await navigator.clipboard.writeText(c.coupon_code);
      setCopied(true);
      toast.success(`Code ${c.coupon_code} copied`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the code");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
      className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-auto"
    >
      <div className="rounded-3xl overflow-hidden glass shadow-card hover:shadow-luxe transition-all">
        <div className="relative aspect-[16/9] bg-muted">
          {c.video_url ? (
            <VideoPlayer url={c.video_url} type={c.video_type} poster={c.banner_url} label={c.name} />
          ) : c.banner_url ? (
            <img src={c.banner_url} alt={c.name} className="size-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="size-full gradient-festive opacity-90" />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-background/85 border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            {occasionLabel(c.occasion)}
          </span>
          {isUpcoming(c) && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              <Timer className="size-3" /> Upcoming
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-display text-lg font-bold line-clamp-1">{c.name}</h3>
          {c.badge_text && <div className="gradient-text font-display text-xl font-bold">{c.badge_text}</div>}
          <OfferCountdownPill campaign={c} />
          {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
          {(c.product_ids?.length ?? 0) > 0 && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Package className="size-3" /> Valid on {c.product_ids!.length} selected product{c.product_ids!.length > 1 ? "s" : ""}
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Link to={((isUpcoming(c) ? "/offers" : c.cta_link || "/shop")) as never} className="flex-1">
              <Button className="w-full rounded-full gradient-festive border-0 font-semibold">
                {isUpcoming(c) ? "See details" : "Shop offer"} <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
            {!isUpcoming(c) && c.coupon_code && (
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy code ${c.coupon_code}`}
                className="rounded-full border border-dashed border-primary px-3 py-2 text-xs font-mono font-bold text-primary inline-flex items-center gap-1.5"
              >
                {c.coupon_code}
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              </button>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
