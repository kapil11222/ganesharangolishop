import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, BadgePercent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { useLiveCampaigns } from "@/components/site/OfferStrip";
import { CountdownBoxes } from "@/components/site/OfferCountdown";
import { accentOf, isLive, occasionLabel } from "@/lib/offers";

/** Flipkart-style "Deals of the Day" rail driven by the live sale campaign, with countdown + top-offer tiles. */
export function DealsOfTheDayRail() {
  const { data: campaigns = [] } = useLiveCampaigns();
  const live = campaigns.filter(isLive);
  const deal = live.filter((c) => (c.discount_percent ?? 0) > 0).sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0))[0];
  const ids = deal?.product_ids ?? [];

  const { data: products = [] } = useQuery<ProductCardData[]>({
    queryKey: ["deals-of-the-day", deal?.id, ids.join(",")],
    enabled: !!deal,
    queryFn: async () => {
      let q = supabase.from("products").select("*").eq("is_active", true).limit(8);
      if (ids.length > 0) q = q.in("id", ids);
      const { data } = await q;
      return (data ?? []) as unknown as ProductCardData[];
    },
  });

  if (!deal || products.length === 0) return null;
  const accent = accentOf(deal);

  return (
    <section className="container-luxe pb-20 md:pb-28" aria-label="Deals of the day">
      <div className="rounded-3xl p-5 md:p-8 glass shadow-luxe" style={{ borderTop: `4px solid ${accent}` }}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: accent }}>
              <Flame className="size-4" /> {occasionLabel(deal.occasion)} sale
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-1">Deals of the Day</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Flat {Math.round(Number(deal.discount_percent))}% off {ids.length > 0 ? "on selected picks" : "sitewide"}
              {deal.urgency_text ? ` · ${deal.urgency_text}` : ""}
            </p>
          </div>
          {deal.ends_at && <CountdownBoxes target={deal.ends_at} />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>

        {live.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-bold mb-3">Top offers for you</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {live.map((c) => (
                <Link
                  key={c.id}
                  to="/offers"
                  className="shrink-0 rounded-2xl border border-border bg-card/60 px-4 py-3 min-w-[210px] hover:shadow-card transition"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: accentOf(c) }}>
                    <BadgePercent className="size-3" /> {occasionLabel(c.occasion)}
                  </div>
                  <div className="font-semibold text-sm mt-1 line-clamp-1">{c.badge_text || c.name}</div>
                  {c.coupon_code && (
                    <div className="mt-1 font-mono text-xs text-muted-foreground">Code {c.coupon_code}</div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
