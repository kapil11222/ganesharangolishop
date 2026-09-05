import { Flame, BadgePercent, Tag, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/cart-store";
import { accentOf, campaignAppliesTo, isLive, isLowestEver, occasionLabel, productSaleFor, type ProductSale } from "@/lib/offers";
import { useLiveCampaigns } from "@/components/site/OfferStrip";
import { useCountdown } from "@/components/site/OfferCountdown";

/** Best live campaign sale for one product (null when nothing applies). */
export function useProductSale(productId: string, price: number): ProductSale | null {
  const { data: campaigns = [] } = useLiveCampaigns();
  return productSaleFor(productId, price, campaigns);
}

/** Corner "X% OFF · Sale" tag for product cards. */
export function SaleTag({ sale }: { sale: ProductSale }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide text-primary-foreground shadow-glow"
      style={{ background: accentOf(sale.campaign) }}
    >
      {sale.percent}% OFF · SALE
    </span>
  );
}

/** "Deal ends in HH:MM:SS" pill shown on discounted cards. */
export function DealEndsPill({ sale, className = "" }: { sale: ProductSale; className?: string }) {
  const { d, h, m, s, over } = useCountdown(sale.campaign.ends_at);
  if (!sale.campaign.ends_at || over) return null;
  const v =
    d > 0
      ? `${d}d ${String(h).padStart(2, "0")}h`
      : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-destructive ${className}`}
    >
      <Flame className="size-3" /> Deal ends in {v}
    </span>
  );
}

/** "Lowest price since launch" tag. */
export function LowestPriceTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ${className}`}
    >
      <TrendingDown className="size-3" /> Lowest price since launch
    </span>
  );
}

/** Sale price block: sale price, struck original, rupee saving, campaign name. */
export function SalePrice({
  sale,
  price,
  mrp,
  big = false,
}: {
  sale: ProductSale;
  price: number;
  mrp?: number | null;
  big?: boolean;
}) {
  const base = mrp && mrp > price ? mrp : price;
  const saved = base - sale.salePrice;
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <div
          className={`font-display font-bold ${big ? "text-3xl sm:text-4xl" : "text-xl"}`}
          style={{ color: accentOf(sale.campaign) }}
        >
          {formatINR(sale.salePrice)}
        </div>
        <div className={`${big ? "text-base sm:text-lg" : "text-xs"} text-muted-foreground line-through`}>
          {formatINR(base)}
        </div>
        <span
          className={`rounded-full bg-emerald-500/12 px-2 py-0.5 font-bold text-emerald-700 ${big ? "text-xs" : "text-[10px]"}`}
        >
          {sale.percent}% off · save {formatINR(saved)}
        </span>
      </div>
      {isLowestEver(sale, price, mrp) && <LowestPriceTag />}
      <div className="text-[11px] font-semibold text-muted-foreground">
        Sale price · {sale.campaign.name}
        {sale.campaign.urgency_text ? ` · ${sale.campaign.urgency_text}` : ""}
      </div>
    </div>
  );
}

/** Flipkart-style "Available offers" box shown right under the product price. */
export function ProductOffersBox({ productId, price }: { productId: string; price: number }) {
  const { data: campaigns = [] } = useLiveCampaigns();
  const applicable = campaigns.filter((c) => isLive(c) && campaignAppliesTo(c, productId));
  const sale = productSaleFor(productId, price, campaigns);
  if (applicable.length === 0) return null;

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-sm font-bold">
        <BadgePercent className="size-4 text-primary" /> Available offers
      </div>
      <ul className="mt-2.5 space-y-2 text-sm">
        {sale && (
          <li className="flex gap-2">
            <Tag className="size-4 shrink-0 mt-0.5" style={{ color: accentOf(sale.campaign) }} />
            <span>
              <b>Sale offer</b> Flat {sale.percent}% off — pay {formatINR(sale.salePrice)} instead of {formatINR(price)}
              <span className="text-muted-foreground"> ({sale.campaign.name})</span>
            </span>
          </li>
        )}
        {applicable.map((c) => (
          <li key={c.id} className="flex gap-2">
            <Tag className="size-4 shrink-0 mt-0.5" style={{ color: accentOf(c) }} />
            <span>
              <b>{occasionLabel(c.occasion)}</b> {c.badge_text || c.description || c.name}
              {c.coupon_code && (
                <>
                  {" "}with code{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(c.coupon_code!);
                        toast.success(`Code ${c.coupon_code} copied`);
                      } catch {
                        toast.error("Could not copy the code");
                      }
                    }}
                    className="font-mono text-xs font-bold uppercase rounded-md border border-dashed border-primary/50 px-1.5 py-0.5 hover:bg-primary/10"
                  >
                    {c.coupon_code}
                  </button>
                </>
              )}
              {c.urgency_text && <span className="text-muted-foreground"> · {c.urgency_text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
