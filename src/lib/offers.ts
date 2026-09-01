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

