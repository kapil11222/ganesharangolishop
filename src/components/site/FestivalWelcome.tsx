import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveCampaigns } from "@/components/site/OfferStrip";
import { CountdownBoxes, countdownTarget } from "@/components/site/OfferCountdown";
import { isLive, pickSaleCampaign, type OfferCampaign } from "@/lib/offers";
import { readTemplate, siteCssOf, welcomeCssOf, sanitizeHtml, THEMES, type FestivalTemplate } from "@/lib/festival";

let shownThisVisit = false;

export function FestivalExperience() {
  const { data: campaigns = [] } = useLiveCampaigns();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const c = pickSaleCampaign(campaigns);
  const tpl = c?.festival_template ? readTemplate(c.festival_template, c.occasion) : null;
  const onAdmin = path.startsWith("/admin") || path.startsWith("/auth");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!tpl || onAdmin) return;
    root.setAttribute("data-festival", tpl.theme);
    root.style.setProperty("--festival-primary", tpl.primary_color);
    root.style.setProperty("--festival-secondary", tpl.secondary_color);
    return () => {
      root.removeAttribute("data-festival");
      root.style.removeProperty("--festival-primary");
      root.style.removeProperty("--festival-secondary");
    };
  }, [tpl?.theme, tpl?.primary_color, tpl?.secondary_color, onAdmin]);

  useEffect(() => {
    if (!c || !tpl?.welcome_enabled || onAdmin || shownThisVisit) return;
    shownThisVisit = true;
    setOpen(true);
  }, [c?.id, tpl?.welcome_enabled, onAdmin]);

  if (!c || !tpl || onAdmin) return null;
  const siteCss = siteCssOf(tpl);
  return <>
    {siteCss && <style data-festival-css dangerouslySetInnerHTML={{ __html: `@scope (.festival-storefront) { ${siteCss.replace(/<\//g, "")} }` }} />}
    <AnimatePresence>{open && <WelcomeScreen campaign={c} tpl={tpl} onClose={() => setOpen(false)} />}</AnimatePresence>
  </>;
}

export function WelcomeScreen({ campaign, tpl, onClose, preview }: {
  campaign: Pick<OfferCampaign, "is_active" | "starts_at" | "ends_at" | "discount_percent" | "cta_link">;
  tpl: FestivalTemplate;
  onClose: () => void;
  preview?: "mobile" | "desktop";
}) {
  const reduce = useReducedMotion();
  const live = isLive(campaign);
  const { phase, at } = countdownTarget(campaign);
  const art = THEMES[tpl.theme].art;
  const duration = Math.min(3, Math.max(2, tpl.duration_seconds));
  // onClose can change during campaign countdown renders; the timer must not restart.
  useEffect(() => {
    if (preview) return;
    const timer = window.setTimeout(onClose, duration * 1000 - 180);
    return () => window.clearTimeout(timer);
  }, [preview, duration]);

  const image = (preview === "desktop" && tpl.desktop_image_url) || tpl.mobile_image_url || tpl.desktop_image_url || art;
  const doc = tpl.custom_html ? `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}${welcomeCssOf(tpl).replace(/<\//g, "")}</style></head><body>${sanitizeHtml(tpl.custom_html).replace(/\{\{COUNTDOWN\}\}|\{\{CTA\}\}/g, "").replace(/\{\{DISCOUNT\}\}/g, String(campaign.discount_percent ?? ""))}</body></html>` : "";

  return <motion.div role="dialog" aria-modal="true" aria-label="Festival offer"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-8%" }}
    transition={{ duration: 0.18 }}
    className={`festival-welcome ${preview ? "absolute" : "fixed"} inset-0 z-[100] overflow-hidden`}
    style={{ "--festival-primary": tpl.primary_color, "--festival-secondary": tpl.secondary_color } as React.CSSProperties}>
    {doc ? <iframe title="Festival welcome" sandbox="" srcDoc={doc} className="absolute inset-0 h-full w-full border-0" /> : <>
      {image && <motion.picture className="absolute inset-0" initial={reduce ? false : { scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}>
        {tpl.desktop_image_url && !preview && <source media="(min-width: 768px)" srcSet={tpl.desktop_image_url} />}
        <img src={image} alt="" className="h-full w-full object-cover" />
      </motion.picture>}
      <div className="festival-welcome-shade absolute inset-0" />
      {!reduce && <div className="festival-ribbons" aria-hidden>{Array.from({ length: { low: 8, medium: 14, high: 22 }[tpl.intensity] }, (_, i) => <i key={i} style={{ left: `${(i * 29) % 100}%`, animationDelay: `${(i % 5) * 0.08}s` }} />)}</div>}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p initial={reduce ? false : { y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="mb-4 text-xs font-bold uppercase tracking-widest">Ganesha Rangoli · {THEMES[tpl.theme].label}</motion.p>
        <motion.h2 initial={reduce ? false : { y: 35, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.08 }} className="festival-welcome-title max-w-xl text-4xl font-black leading-tight md:text-6xl">{tpl.greeting}</motion.h2>
        <motion.div initial={reduce ? false : { y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25, delay: 0.2 }} className="mt-5">
          <span className="festival-welcome-ticket inline-block px-5 py-2 text-xl font-black">{live ? campaign.discount_percent ? `${campaign.discount_percent}% OFF` : "SALE IS LIVE" : "STARTING SOON"}</span>
          <p className="mx-auto mt-4 max-w-sm text-sm font-medium">{tpl.subtitle}</p>
        </motion.div>
      </div>
    </>}
    <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-5 pb-9 pt-5 ${doc ? "festival-welcome-shade" : ""}`}>
      {phase !== "none" && <div className="flex items-center gap-2 text-xs font-semibold"><span>{phase === "starts" ? "Starts in" : "Ends in"}</span><CountdownBoxes target={at} /></div>}
      <Button asChild variant="secondary" className="h-10 px-6 font-bold"><Link to={campaign.cta_link?.startsWith("/") ? (campaign.cta_link as "/shop") : "/shop"} onClick={onClose}>{tpl.cta_text}<ArrowRight /></Link></Button>
    </div>
    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="festival-skip absolute right-4 top-4">Skip<X className="size-4" /></Button>
    {!preview && <motion.div aria-hidden className="festival-welcome-progress absolute inset-x-0 bottom-0 h-1 origin-left" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: duration - 0.18, ease: "linear" }} />}
  </motion.div>;
}
