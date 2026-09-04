import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, Timer, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { accentOf, isLive, occasionLabel, pickSaleCampaign } from "@/lib/offers";
import { useLiveCampaigns, OfferStrip } from "@/components/site/OfferStrip";
import { useCountdown, countdownTarget } from "@/components/site/OfferCountdown";
import { SaleReminderButton } from "@/components/site/SaleReminderButton";

/** Shows exactly one sitewide offer bar: the sale bar when a campaign owns it, else the ticker. */
export function OfferBars() {
  const { data: campaigns = [] } = useLiveCampaigns();
  return pickSaleCampaign(campaigns) ? <SaleModeBar /> : <OfferStrip />;
}

/** Flipkart-style sitewide sale bar: takes over the top of every page while a sale-mode campaign runs. */
export function SaleModeBar() {
  const { data: campaigns = [] } = useLiveCampaigns();
  const c = pickSaleCampaign(campaigns);
  if (!c) return null;


  const live = isLive(c);
  const accent = accentOf(c);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden border-b border-border"
      style={{
        background: `linear-gradient(100deg, ${accent} 0%, color-mix(in oklab, ${accent} 70%, black) 55%, ${accent} 100%)`,
      }}
    >
      <div className="container-luxe py-2.5 md:py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-primary-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
            {live ? <Zap className="size-3" /> : <Timer className="size-3" />}
            {live ? "Sale is live" : "Coming soon"}
          </span>
          <div className="min-w-0">
            <div className="font-display text-sm md:text-lg font-bold truncate">
              {occasionLabel(c.occasion)} · {c.name}
            </div>
            {(c.urgency_text || c.badge_text) && (
              <div className="text-[11px] md:text-xs opacity-90 truncate">{c.urgency_text || c.badge_text}</div>
            )}
          </div>
        </div>

        <BarCountdown campaign={c} />

        <div className="flex items-center gap-2">
          {live && c.coupon_code && (
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
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/40 bg-primary-foreground/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-primary-foreground/20 transition"
            >
              {c.coupon_code} <Copy className="size-3" />
            </button>
          )}

          <Link to={c.cta_link?.startsWith("/") ? (c.cta_link as "/shop") : "/shop"}>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-4 py-1.5 text-xs md:text-sm font-bold text-foreground hover:opacity-90 transition">
              {live ? "Shop the sale" : "Preview deals"} <ArrowRight className="size-3.5" />
            </button>
          </Link>
          {!live && <SaleReminderButton campaign={c} />}
        </div>
      </div>
    </motion.div>
  );
}

function BarCountdown({ campaign }: { campaign: Parameters<typeof countdownTarget>[0] }) {
  const { phase, at } = countdownTarget(campaign);
  const { d, h, m, s, over } = useCountdown(at);
  if (phase === "none" || over) return null;
  const cells = [
    { v: d, l: "D" },
    { v: h, l: "H" },
    { v: m, l: "M" },
    { v: s, l: "S" },
  ];
  return (
    <div className="flex items-center gap-2 text-primary-foreground">
      <span className="text-[11px] md:text-xs font-semibold uppercase tracking-wider opacity-90">
        {phase === "starts" ? "Starts in" : "Ends in"}
      </span>
      <div className="flex gap-1">
        {cells.map((cell) => (
          <span
            key={cell.l}
            className="min-w-[34px] rounded-lg bg-primary-foreground/20 px-1.5 py-1 text-center text-xs md:text-sm font-bold tabular-nums"
          >
            {String(cell.v).padStart(2, "0")}
            <span className="ml-0.5 text-[9px] opacity-80">{cell.l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
