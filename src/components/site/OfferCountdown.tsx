import { useEffect, useState } from "react";
import { Clock, Timer } from "lucide-react";
import { campaignStatus, type OfferCampaign } from "@/lib/offers";

export function useCountdown(target?: string | null) {
  const [left, setLeft] = useState(() => (target ? new Date(target).getTime() - Date.now() : 0));
  useEffect(() => {
    if (!target) return;
    setLeft(new Date(target).getTime() - Date.now());
    const t = setInterval(() => setLeft(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const clamped = Math.max(0, left);
  return {
    d: Math.floor(clamped / 86400000),
    h: Math.floor((clamped / 3600000) % 24),
    m: Math.floor((clamped / 60000) % 60),
    s: Math.floor((clamped / 1000) % 60),
    over: !target || clamped <= 0,
  };
}

/** What a campaign is counting toward: its start (if not started) or its end. */
export function countdownTarget(c: Pick<OfferCampaign, "is_active" | "starts_at" | "ends_at">) {
  const st = campaignStatus(c);
  if (st === "scheduled") return { phase: "starts" as const, at: c.starts_at };
  if (st === "live" && c.ends_at) return { phase: "ends" as const, at: c.ends_at };
  return { phase: "none" as const, at: null };
}

/** Compact inline "Starts in 2d 04h 12m" / "Ends in …" pill. */
export function OfferCountdownPill({
  campaign,
  className = "",
}: {
  campaign: Pick<OfferCampaign, "is_active" | "starts_at" | "ends_at">;
  className?: string;
}) {
  const { phase, at } = countdownTarget(campaign);
  const { d, h, m, s, over } = useCountdown(at);
  if (phase === "none" || over) return null;
  const parts = d > 0 ? `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m` : `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tabular-nums ${
        phase === "starts"
          ? "border-blue-500/40 bg-blue-500/10 text-blue-600"
          : "border-primary/40 bg-primary/10 text-primary"
      } ${className}`}
    >
      {phase === "starts" ? <Timer className="size-3" /> : <Clock className="size-3" />}
      {phase === "starts" ? "Starts in" : "Ends in"} {parts}
    </span>
  );
}

/** Boxed d/h/m/s countdown for hero-style blocks. */
export function CountdownBoxes({ target }: { target?: string | null }) {
  const { d, h, m, s, over } = useCountdown(target);
  if (over) return null;
  const cells = [
    { v: d, l: "Days" },
    { v: h, l: "Hrs" },
    { v: m, l: "Min" },
    { v: s, l: "Sec" },
  ];
  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div key={c.l} className="min-w-[62px] rounded-2xl bg-background/70 border border-border px-3 py-2 text-center shadow-card">
          <div className="font-display text-2xl font-bold tabular-nums">{String(c.v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.l}</div>
        </div>
      ))}
    </div>
  );
}
