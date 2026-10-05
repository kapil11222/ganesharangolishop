import { z } from "zod";
import diwali from "@/assets/festival-diwali.jpg";
import navratri from "@/assets/festival-navratri.jpg";
import holi from "@/assets/festival-holi.jpg";
import ganesh from "@/assets/festival-ganesh-chaturthi.jpg";

export const THEMES = {
  diwali: { label: "Diwali", art: diwali, primary: "#d97706", secondary: "#7c2d12", emoji: "🪔" },
  navratri: { label: "Navratri", art: navratri, primary: "#dc2626", secondary: "#9a3412", emoji: "🔱" },
  holi: { label: "Holi", art: holi, primary: "#db2777", secondary: "#7c3aed", emoji: "🎨" },
  "ganesh-chaturthi": { label: "Ganesh Chaturthi", art: ganesh, primary: "#ea580c", secondary: "#b91c1c", emoji: "🌺" },
  "raksha-bandhan": { label: "Raksha Bandhan", art: null, primary: "#e11d48", secondary: "#ca8a04", emoji: "🧿" },
  wedding: { label: "Wedding", art: null, primary: "#be123c", secondary: "#a16207", emoji: "💐" },
  "new-year": { label: "New Year", art: null, primary: "#2563eb", secondary: "#0f172a", emoji: "🎆" },
  sale: { label: "Big Sale", art: null, primary: "#c2410c", secondary: "#1e3a8a", emoji: "⚡" },
} as const;
export type ThemeKey = keyof typeof THEMES;
export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
export const ANIMATIONS = ["sparkle", "petals", "glow", "zoom"] as const;
export const INTENSITIES = ["low", "medium", "high"] as const;

const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Colour must be like #d97706");
const text = (max: number) =>
  z.string().max(max).refine((v) => !/[<>{}]|javascript:|on\w+\s*=/i.test(v), "Text cannot contain code");
const url = z
  .string()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/[^\s"'<>]+$/i.test(v), "Only https image links allowed");

export const festivalSchema = z
  .object({
    version: z.literal(1),
    theme: z.enum(THEME_KEYS as [ThemeKey, ...ThemeKey[]]),
    welcome_enabled: z.boolean(),
    animation: z.enum(ANIMATIONS),
    duration_seconds: z.number().int().min(2).max(8),
    intensity: z.enum(INTENSITIES),
    greeting: text(60),
    subtitle: text(140),
    cta_text: text(30),
    primary_color: hex,
    secondary_color: hex,
    desktop_image_url: url,
    mobile_image_url: url,
    custom_html: z.string().max(20000).optional(),
    custom_css: z.string().max(20000).optional(),
  })
  .strict();
export type FestivalTemplate = z.infer<typeof festivalSchema>;

export function defaultTemplate(theme: ThemeKey = "sale"): FestivalTemplate {
  const t = THEMES[theme];
  return {
    version: 1,
    theme,
    welcome_enabled: true,
    animation: theme === "holi" ? "petals" : theme === "diwali" ? "glow" : "sparkle",
    duration_seconds: 3,
    intensity: "medium",
    greeting: theme === "sale" ? "The Big Sale is here" : `Happy ${t.label}!`,
    subtitle: "Celebrate with handcrafted rangolis at special prices.",
    cta_text: "Shop the offer",
    primary_color: t.primary,
    secondary_color: t.secondary,
    desktop_image_url: "",
    mobile_image_url: "",
  };
}

export function themeForOccasion(occasion: string): ThemeKey {
  return (THEME_KEYS as string[]).includes(occasion) ? (occasion as ThemeKey) : "sale";
}

/** Read stored template safely; anything invalid falls back to the built-in theme. */
export function readTemplate(raw: unknown, occasion = "sale"): FestivalTemplate {
  const r = festivalSchema.safeParse(raw);
  return r.success ? { ...r.data, duration_seconds: Math.min(3, r.data.duration_seconds) } : defaultTemplate(themeForOccasion(occasion));
}

/** Parse admin-pasted ChatGPT output. Returns data or human-readable errors. */
/** Make pasted CSS safe: no imports, no scripts, only https images, cannot break out of <style>. */
export function sanitizeCss(css: string) {
  return css
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/@import[^;]*;?/gi, "")
    .replace(/expression\s*\(|javascript:|behavior\s*:|-moz-binding/gi, "")
    .replace(/url\(\s*['"]?(?!https:)[^)]*\)/gi, "none")
    .slice(0, 20000);
}

/** Strip scripts, event handlers and non-https links from pasted HTML (also rendered only inside a sandboxed frame). */
export function sanitizeHtml(html: string) {
  return html
    .replace(/<(script|iframe|object|embed|form|link|meta|base)[\s\S]*?(<\/\1>|\/?>)/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')(?!https:|#)[^"']*\2/gi, '$1=""')
    .slice(0, 20000);
}

/** Accept ChatGPT HTML/CSS (preferred) or the older JSON format. */
export function parsePastedTemplate(input: string, base?: FestivalTemplate): { ok: true; data: FestivalTemplate } | { ok: false; errors: string[] } {
  const raw = input.trim().replace(/^```(?:html|css|json)?/i, "").replace(/```$/, "").trim();
  if (raw.startsWith("<") || /<style/i.test(raw)) {
    const css = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
    const siteCss = [...raw.matchAll(/\/\*\s*SITE\s*\*\/([\s\S]*?)\/\*\s*END SITE\s*\*\//gi)].map((m) => m[1]).join("\n");
    let html = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (body) html = body[1];
    html = sanitizeHtml(html.replace(/<\/?(html|head|body|!doctype)[^>]*>/gi, "")).trim();
    if (!html) return { ok: false, errors: ["No HTML found. Paste the full reply from ChatGPT."] };
    const img = raw.match(/https:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|webp)/i)?.[0] ?? "";
    const b = base ?? defaultTemplate();
    return {
      ok: true,
      data: {
        ...b,
        custom_html: html,
        custom_css: sanitizeCss(css.replace(/\/\*\s*SITE\s*\*\/[\s\S]*?\/\*\s*END SITE\s*\*\//gi, "")) + (siteCss ? "\n/*SITE*/" + sanitizeCss(siteCss) : ""),
        mobile_image_url: b.mobile_image_url || img,
        desktop_image_url: b.desktop_image_url || img,
      },
    };
  }
  return parseJsonTemplate(raw);
}

/** CSS part meant for the whole shop (between SITE markers). */
export function siteCssOf(t: FestivalTemplate) {
  const css = t.custom_css ?? "";
  const i = css.indexOf("/*SITE*/");
  return i >= 0 ? css.slice(i + 8) : "";
}
export function welcomeCssOf(t: FestivalTemplate) {
  const c = t.custom_css ?? "";
  const i = c.indexOf("/*SITE*/");
  return i >= 0 ? c.slice(0, i) : c;
}

function parseJsonTemplate(input: string): { ok: true; data: FestivalTemplate } | { ok: false; errors: string[] } {
  let s = input.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  if (s.length > 5000) return { ok: false, errors: ["Pasted text is too long"] };
  let json: unknown;
  try {
    json = JSON.parse(s);
  } catch {
    return { ok: false, errors: ["This is not valid JSON. Paste only the JSON block from ChatGPT."] };
  }
  const r = festivalSchema.safeParse(json);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, errors: r.error.issues.map((i) => `${i.path.join(".") || "template"}: ${i.message}`) };
}

export function chatGptPrompt(c: { name: string; occasion: string; starts_at?: string; ends_at?: string; discount?: number | string }) {
  return `Design a festival sale welcome screen AND a sitewide festival look for "Ganesha Rangoli", an Indian handmade rangoli shop (95% visitors on mobile).
Campaign: ${c.name || "(name)"} | Occasion: ${c.occasion} | Starts: ${c.starts_at || "now"} | Ends: ${c.ends_at || "open"} | Discount: ${c.discount || 0}%

Reply with ONE html code block containing:
1. A <style> block for a punchy 2–3 second welcome: crisp festival artwork, bold sans-serif sale typography, fast reveal and a clean exit. Modern Indian marketplace sale energy, not floating emoji or slow glowing effects. Use CSS @keyframes only; respect prefers-reduced-motion.
2. Inside the same <style>, a section wrapped exactly like:
   /* SITE */ ...css... /* END SITE */
   that restyles the whole shop for the festival. Scope EVERY selector under html[data-festival] .festival-storefront. Available hooks: .festival-nav, .festival-sale, .festival-sale-art, .festival-product, .festival-storefront main, .festival-storefront footer. Built-in styling already transforms navigation, shopping surfaces, product cards and the sale masthead. Keep readable white product surfaces and bold sans-serif headings. Do not hide controls or change prices.
3. The welcome HTML (no <html>/<head> needed). Use placeholders {{COUNTDOWN}}, {{DISCOUNT}}, {{CTA}} where the live countdown, discount and the shop button should appear.
4. For pictures use a real public https image URL (e.g. from images.unsplash.com) of the festival in <img src="https://...">.

Rules: NO JavaScript, NO <script>, NO onclick/on* attributes, NO forms, NO iframes, NO @import. Pure HTML + CSS only.`;
}
