import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useLiveCampaigns } from "@/components/site/OfferStrip";
import { CountdownBoxes, countdownTarget } from "@/components/site/OfferCountdown";
import { isLive, pickSaleCampaign, type OfferCampaign } from "@/lib/offers";
import { readTemplate, siteCssOf, welcomeCssOf, sanitizeHtml, THEMES, type FestivalTemplate } from "@/lib/festival";

// Module-level: resets on every fresh page load, persists across in-app navigation.
let shownThisVisit = false;

/** Applies festival colours sitewide while a campaign owns it, and shows the welcome screen once per visit. */
export function FestivalExperience() {
  const { data: campaigns = [] } = useLiveCampaigns();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const c = pickSaleCampaign(campaigns);
  const tpl = c && c.festival_template ? readTemplate(c.festival_template, c.occasion) : null;
  const onAdmin = path.startsWith("/admin") || path.startsWith("/auth");

  useEffect(() => {
    const root = document.documentElement;
    if (!tpl || onAdmin) {
      root.removeAttribute("data-festival");
      root.style.removeProperty("--festival-primary");
      root.style.removeProperty("--festival-secondary");
      return;
    }
    root.setAttribute("data-festival", tpl.theme);
    root.style.setProperty("--festival-primary", tpl.primary_color);
    root.style.setProperty("--festival-secondary", tpl.secondary_color);
    return () => {
      root.removeAttribute("data-festival");
      root.style.removeProperty("--festival-primary");
      root.style.removeProperty("--festival-secondary");
    };
  }, [tpl?.theme, tpl?.primary_color, tpl?.secondary_color, onAdmin]);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!c || !tpl?.welcome_enabled || onAdmin || shownThisVisit) return;
    shownThisVisit = true;
    setOpen(true);
  }, [c?.id, tpl?.welcome_enabled, onAdmin]);

  if (!c || !tpl) return null;
  const siteCss = onAdmin ? "" : siteCssOf(tpl);
  return (
    <>
    {siteCss && <style data-festival-css dangerouslySetInnerHTML={{ __html: siteCss.replace(/<\//g, "") }} />}
    <AnimatePresence>
      {open && <WelcomeScreen campaign={c} tpl={tpl} onClose={() => setOpen(false)} />}
    </AnimatePresence>
    </>
  );
}

export function WelcomeScreen({
  campaign,
  tpl,
  onClose,
  preview,
}: {
  campaign: Pick<OfferCampaign, "is_active" | "starts_at" | "ends_at" | "discount_percent" | "cta_link">;
  tpl: FestivalTemplate;
  onClose: () => void;
  preview?: "mobile" | "desktop";
}) {
  const reduce = useReducedMotion();
  const live = isLive(campaign);
  const { phase, at } = countdownTarget(campaign);
  const art = THEMES[tpl.theme].art;

  useEffect(() => {
    if (preview) return;
    const t = setTimeout(onClose, tpl.duration_seconds * 1000 + (at ? 2000 : 0));
    return () => clearTimeout(t);
  }, [preview, tpl.duration_seconds, at, onClose]);

  const count = { low: 10, medium: 20, high: 34 }[tpl.intensity];
  const bits = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ x: (i * 37) % 100, d: (i % 7) * 0.35, s: 10 + ((i * 13) % 18) })),
    [count],
  );
  const emoji = tpl.animation === "petals" ? "🌸" : tpl.animation === "glow" ? "🪔" : THEMES[tpl.theme].emoji;

  const fixed = preview ? "absolute" : "fixed";
  if (tpl.custom_html) {
    const doc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}${welcomeCssOf(tpl).replace(/<\//g, "")}</style></head><body>${sanitizeHtml(tpl.custom_html)
      .replace(/\{\{COUNTDOWN\}\}|\{\{CTA\}\}/g, "")
      .replace(/\{\{DISCOUNT\}\}/g, String(campaign.discount_percent ?? ""))}</body></html>`;
    return (
      <motion.div role="dialog" aria-label="Festival offer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`${fixed} inset-0 z-[100] bg-background`}>
        <iframe title="Festival welcome" sandbox="" srcDoc={doc} className="absolute inset-0 h-full w-full border-0" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16">
          {phase !== "none" && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">{phase === "starts" ? "Offer starts in" : "Offer ends in"}</span>
              <CountdownBoxes target={at} />
            </div>
          )}
          <Link to={campaign.cta_link?.startsWith("/") ? (campaign.cta_link as "/shop") : "/shop"} onClick={onClose}
            className="inline-flex rounded-full bg-primary-foreground px-6 py-3 text-sm font-bold text-foreground shadow-lg">{tpl.cta_text}</Link>
        </div>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          Skip <X className="size-3.5" />
        </button>
      </motion.div>
    );
  }
  return (
    <motion.div
      role="dialog"
      aria-label="Festival offer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className={`${fixed} inset-0 z-[100] flex items-center justify-center overflow-hidden text-primary-foreground`}
      style={{ background: `radial-gradient(circle at 50% 30%, ${tpl.primary_color}, ${tpl.secondary_color})` }}
    >
      {(tpl.mobile_image_url || tpl.desktop_image_url || art) && (
        <picture className="absolute inset-0">
          {tpl.desktop_image_url && <source media="(min-width: 768px)" srcSet={tpl.desktop_image_url} />}
          <img
            src={(preview === "desktop" && tpl.desktop_image_url) || tpl.mobile_image_url || tpl.desktop_image_url || art || ""}
            alt=""
            className="h-full w-full object-cover opacity-45"
          />
        </picture>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      {!reduce &&
        bits.map((b, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute top-0"
            style={{ left: `${b.x}%`, fontSize: b.s }}
            initial={{ y: -40, opacity: 0 }}
            animate={tpl.animation === "glow" ? { y: [600, 300], opacity: [0, 1, 0] } : { y: [-40, 900], opacity: [0, 1, 0.6], rotate: 180 }}
            transition={{ duration: 4 + (i % 3), delay: b.d, repeat: Infinity }}
          >
            {tpl.animation === "sparkle" ? "✨" : emoji}
          </motion.span>
        ))}

      <motion.div
        initial={reduce ? false : tpl.animation === "zoom" ? { scale: 0.6, opacity: 0 } : { y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className={`relative mx-5 max-w-md text-center ${preview === "desktop" ? "max-w-xl" : ""}`}
      >
        <div className="text-5xl mb-3" aria-hidden>{THEMES[tpl.theme].emoji}</div>
        <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
          {live ? `Sale is live${campaign.discount_percent ? ` · ${campaign.discount_percent}% off` : ""}` : "Offer starting soon"}
        </span>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold leading-tight drop-shadow">{tpl.greeting}</h2>
        <p className="mt-2 text-sm md:text-base opacity-90">{tpl.subtitle}</p>
        {phase !== "none" && (
          <div className="mt-5 flex flex-col items-center gap-2 text-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              {phase === "starts" ? "Offer starts in" : "Offer ends in"}
            </span>
            <CountdownBoxes target={at} />
          </div>
        )}
        <Link
          to={campaign.cta_link?.startsWith("/") ? (campaign.cta_link as "/shop") : "/shop"}
          onClick={onClose}
          className="mt-6 inline-flex rounded-full bg-primary-foreground px-6 py-3 text-sm font-bold text-foreground shadow-lg"
        >
          {tpl.cta_text}
        </Link>
      </motion.div>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold"
      >
        Skip <X className="size-3.5" />
      </button>
    </motion.div>
  );
}
