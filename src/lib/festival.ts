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
    duration_seconds: 4,
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
  return r.success ? r.data : defaultTemplate(themeForOccasion(occasion));
}

/** Parse admin-pasted ChatGPT output. Returns data or human-readable errors. */
export function parsePastedTemplate(input: string): { ok: true; data: FestivalTemplate } | { ok: false; errors: string[] } {
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
  return `You are designing a festival sale welcome screen for "Ganesha Rangoli", an Indian handmade rangoli shop.
Campaign: ${c.name || "(name)"} | Occasion: ${c.occasion} | Starts: ${c.starts_at || "now"} | Ends: ${c.ends_at || "open"} | Discount: ${c.discount || 0}%

Reply with ONLY one JSON object (no explanation, no HTML, no CSS, no JavaScript) in exactly this format:
{
  "version": 1,
  "theme": one of ${THEME_KEYS.map((k) => `"${k}"`).join(", ")},
  "welcome_enabled": true,
  "animation": one of ${ANIMATIONS.map((k) => `"${k}"`).join(", ")},
  "duration_seconds": integer 2-8,
  "intensity": one of "low", "medium", "high",
  "greeting": short headline, max 60 characters,
  "subtitle": supporting line, max 140 characters,
  "cta_text": button text, max 30 characters,
  "primary_color": hex colour like "#d97706",
  "secondary_color": hex colour like "#7c2d12",
  "desktop_image_url": "" (leave empty),
  "mobile_image_url": "" (leave empty)
}
Rules: no extra keys, no < > { } characters inside text, warm festive Indian tone, colours must suit the festival.`;
}
