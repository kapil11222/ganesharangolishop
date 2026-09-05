export const OCCASIONS = [
  "general",
  "diwali",
  "navratri",
  "holi",
  "raksha-bandhan",
  "ganesh-chaturthi",
  "wedding",
  "new-year",
  "clearance",
] as const;

export type Occasion = (typeof OCCASIONS)[number] | string;

export const occasionLabel = (o: string) =>
  o
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export type OfferCampaign = {
  id: string;
  name: string;
  occasion: string;
  description: string | null;
  badge_text: string | null;
  banner_url: string | null;
  coupon_code: string | null;
  discount_percent: number | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  video_url?: string | null;
  video_type?: string | null;
  product_ids?: string[] | null;
  /** Sale-mode presentation (Flipkart-style sale period) */
  accent_color?: string | null;
  sale_mode?: boolean | null;
  priority?: number | null;
  urgency_text?: string | null;
};


export function campaignStatus(c: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
  const now = Date.now();
  if (!c.is_active) return "paused" as const;
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return "scheduled" as const;
  if (c.ends_at && new Date(c.ends_at).getTime() < now) return "expired" as const;
  return "live" as const;
}

export function isLive(c: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
  return campaignStatus(c) === "live";
}

/** Scheduled (announced but not started yet) campaigns — used for "Offer starts in …" teasers. */
export function isUpcoming(c: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
  return campaignStatus(c) === "scheduled";
}

export function isLiveOrUpcoming(c: { is_active: boolean; starts_at: string | null; ends_at: string | null }) {
  const st = campaignStatus(c);
  return st === "live" || st === "scheduled";
}


/* ------------------------------------------------------------------ *
 * Sale-mode helpers (Flipkart-style "sale period" experience)
 * ------------------------------------------------------------------ */

const byPriority = (a: OfferCampaign, b: OfferCampaign) =>
  (b.priority ?? 0) - (a.priority ?? 0) || a.display_order - b.display_order;

/** The campaign that owns the sitewide sale bar: live sale-mode wins, else upcoming sale-mode. */
export function pickSaleCampaign(campaigns: OfferCampaign[]): OfferCampaign | null {
  const sale = campaigns.filter((c) => c.sale_mode && isLiveOrUpcoming(c)).sort(byPriority);
  const picked = sale.find(isLive) ?? sale[0] ?? null;
  if (picked) return picked;
  // Fallback: any live/upcoming campaign still deserves the sitewide sale bar.
  const any = campaigns.filter(isLiveOrUpcoming).sort(byPriority);
  return any.find(isLive) ?? any[0] ?? null;
}

export function campaignAppliesTo(c: OfferCampaign, productId: string) {
  const ids = c.product_ids ?? [];
  return ids.length === 0 || ids.includes(productId);
}

export type ProductSale = {
  campaign: OfferCampaign;
  percent: number;
  salePrice: number;
};

/** Best live campaign discount for a product, or null when no sale applies. */
export function productSaleFor(
  productId: string,
  price: number,
  campaigns: OfferCampaign[],
): ProductSale | null {
  const best = campaigns
    .filter((c) => isLive(c) && (c.discount_percent ?? 0) > 0 && campaignAppliesTo(c, productId))
    .sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0))[0];
  if (!best) return null;
  const percent = Math.min(90, Math.round(Number(best.discount_percent)));
  const salePrice = Math.max(1, Math.round(price - (price * percent) / 100));
  if (salePrice >= price) return null;
  return { campaign: best, percent, salePrice };
}

/**
 * True when the sale price is the lowest this product has ever been offered at:
 * below both its regular selling price and its MRP.
 */
export function isLowestEver(sale: ProductSale, price: number, mrp?: number | null) {
  return sale.salePrice < price && (!mrp || sale.salePrice < mrp);
}

/** Safe CSS colour for a campaign accent (falls back to the brand primary). */
export function accentOf(c?: OfferCampaign | null) {
  const v = (c?.accent_color ?? "").trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : "var(--primary)";
}
