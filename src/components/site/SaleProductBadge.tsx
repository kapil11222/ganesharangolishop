import { Flame } from "lucide-react";
import { formatINR } from "@/lib/cart-store";
import { accentOf, productSaleFor, type ProductSale } from "@/lib/offers";
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

/** Sale price block: sale price, struck original, campaign name. */
export function SalePrice({ sale, price, big = false }: { sale: ProductSale; price: number; big?: boolean }) {
  return (
    <div>
      <div className="flex items-end gap-2">
        <div
          className={`font-display font-bold ${big ? "text-4xl" : "text-xl"}`}
          style={{ color: accentOf(sale.campaign) }}
        >
          {formatINR(sale.salePrice)}
        </div>
        <div className={`${big ? "text-lg" : "text-xs"} text-muted-foreground line-through`}>{formatINR(price)}</div>
      </div>
      <div className="text-[11px] font-semibold text-emerald-600">
        Sale price · {sale.campaign.name}
        {sale.campaign.urgency_text ? ` · ${sale.campaign.urgency_text}` : ""}
      </div>
    </div>
  );
}
