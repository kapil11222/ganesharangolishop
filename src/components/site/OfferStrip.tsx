import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BadgePercent, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isLive, occasionLabel, type OfferCampaign } from "@/lib/offers";
import { toast } from "sonner";

export function useLiveCampaigns() {
  return useQuery<OfferCampaign[]>({
    queryKey: ["offer-campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("offer_campaigns")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      return ((data ?? []) as OfferCampaign[]).filter(isLive);
    },
    staleTime: 5 * 60_000,
  });
}

/** Sitewide auto-rotating offer ticker (Flipkart/Meesho style). */
export function OfferStrip() {
  const { data: campaigns = [] } = useLiveCampaigns();
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const count = campaigns.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % count), 4500);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const c = campaigns[i % count];

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
    <div className="relative overflow-hidden gradient-festive text-primary-foreground">
      <div className="container-luxe h-9 md:h-10 flex items-center justify-center gap-3 text-[11px] md:text-xs font-semibold">
        <BadgePercent className="size-3.5 shrink-0" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 min-w-0"
          >
            <Link to="/offers" className="truncate hover:underline">
              <span className="uppercase tracking-wider opacity-90">{occasionLabel(c.occasion)}</span>
              <span className="mx-1.5 opacity-60">·</span>
              {c.badge_text || c.name}
            </Link>
            {c.coupon_code && (
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 px-2 py-0.5 font-mono transition"
                aria-label={`Copy code ${c.coupon_code}`}
              >
                {c.coupon_code}
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
