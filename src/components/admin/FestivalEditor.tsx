import { useState } from "react";
import { Copy, Eye, RotateCcw, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { WelcomeScreen } from "@/components/site/FestivalWelcome";
import {
  ANIMATIONS, INTENSITIES, THEMES, THEME_KEYS, chatGptPrompt, defaultTemplate, parsePastedTemplate,
  type FestivalTemplate, type ThemeKey,
} from "@/lib/festival";

type Ctx = { name: string; occasion: string; starts_at: string; ends_at: string; discount_percent: number; cta_link: string; is_active: boolean };

export function FestivalEditor({
  value, onChange, ctx,
}: { value: FestivalTemplate | null; onChange: (v: FestivalTemplate | null) => void; ctx: Ctx }) {
  const [paste, setPaste] = useState("");
  const [pending, setPending] = useState<FestivalTemplate | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<"mobile" | "desktop" | null>(null);
  const tpl = value;
  const set = (p: Partial<FestivalTemplate>) => tpl && onChange({ ...tpl, ...p });
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm";
  const campaign = {
    is_active: true,
    starts_at: ctx.starts_at ? new Date(ctx.starts_at).toISOString() : null,
    ends_at: ctx.ends_at ? new Date(ctx.ends_at).toISOString() : null,
    discount_percent: ctx.discount_percent,
    cta_link: ctx.cta_link,
  };

  return (
    <div className="md:col-span-2 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-base">Festival UI</Label>
          <p className="text-xs text-muted-foreground">Special theme + welcome animation, only while this offer runs.</p>
        </div>
        <Switch
          checked={!!tpl}
          onCheckedChange={(v) => onChange(v ? defaultTemplate((THEME_KEYS as string[]).includes(ctx.occasion) ? (ctx.occasion as ThemeKey) : "sale") : null)}
        />
      </div>
      {tpl && (
        <>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Festival theme</Label>
              <select className={sel} value={tpl.theme} onChange={(e) => { const k = e.target.value as ThemeKey; set({ theme: k, primary_color: THEMES[k].primary, secondary_color: THEMES[k].secondary }); }}>
                {THEME_KEYS.map((k) => <option key={k} value={k}>{THEMES[k].emoji} {THEMES[k].label}</option>)}
              </select>
            </div>
            <div><Label>Animation style</Label>
              <select className={sel} value={tpl.animation} onChange={(e) => set({ animation: e.target.value as FestivalTemplate["animation"] })}>
                {ANIMATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><Label>Greeting</Label><Input maxLength={60} value={tpl.greeting} onChange={(e) => set({ greeting: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Supporting text</Label><Input maxLength={140} value={tpl.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></div>
            <div><Label>Button text</Label><Input maxLength={30} value={tpl.cta_text} onChange={(e) => set({ cta_text: e.target.value })} /></div>
            <div><Label>Show for (seconds)</Label><Input type="number" min={2} max={8} value={tpl.duration_seconds} onChange={(e) => set({ duration_seconds: Math.min(8, Math.max(2, Number(e.target.value) || 4)) })} /></div>
            <div><Label>Main colour</Label><Input type="color" className="p-1" value={tpl.primary_color} onChange={(e) => set({ primary_color: e.target.value })} /></div>
            <div><Label>Second colour</Label><Input type="color" className="p-1" value={tpl.secondary_color} onChange={(e) => set({ secondary_color: e.target.value })} /></div>
            <div><Label>Decoration amount</Label>
              <select className={sel} value={tpl.intensity} onChange={(e) => set({ intensity: e.target.value as FestivalTemplate["intensity"] })}>
                {INTENSITIES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex items-end justify-between gap-2"><Label>Welcome animation on every visit</Label><Switch checked={tpl.welcome_enabled} onCheckedChange={(v) => set({ welcome_enabled: v })} /></div>
            <div><Label>Desktop artwork (optional)</Label><ImageUpload bucket="banner-images" value={tpl.desktop_image_url} onChange={(v) => set({ desktop_image_url: (v as string) || "" })} label="Upload" /></div>
            <div><Label>Mobile artwork (optional)</Label><ImageUpload bucket="banner-images" value={tpl.mobile_image_url} onChange={(v) => set({ mobile_image_url: (v as string) || "" })} label="Upload" /></div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPreview("mobile")}><Eye className="size-4 mr-1" />Mobile preview</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPreview("desktop")}><Eye className="size-4 mr-1" />Desktop preview</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(defaultTemplate(tpl.theme))}><RotateCcw className="size-4 mr-1" />Reset to built-in theme</Button>
          </div>
          {preview && (
            <div className="space-y-2">
              <div className={`relative mx-auto overflow-hidden rounded-2xl border ${preview === "mobile" ? "h-[560px] w-[300px]" : "h-[380px] w-full"}`}>
                <WelcomeScreen campaign={campaign} tpl={tpl} preview={preview} onClose={() => setPreview(null)} />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-background p-3 space-y-2">
            <Label className="flex items-center gap-1"><Wand2 className="size-4" /> ChatGPT template assistant</Label>
            <p className="text-xs text-muted-foreground">1. Copy the prompt and paste it in ChatGPT. 2. Paste ChatGPT's full HTML/CSS reply below (pictures links included). 3. Check, preview and apply. Scripts and unsafe code are removed automatically.</p>
            <Button type="button" size="sm" variant="outline" onClick={async () => {
              try { await navigator.clipboard.writeText(chatGptPrompt({ name: ctx.name, occasion: ctx.occasion, starts_at: ctx.starts_at, ends_at: ctx.ends_at, discount: ctx.discount_percent })); toast.success("Prompt copied — paste it in ChatGPT"); }
              catch { toast.error("Could not copy"); }
            }}><Copy className="size-4 mr-1" />Copy prompt for ChatGPT</Button>
            <Textarea rows={5} value={paste} onChange={(e) => { setPaste(e.target.value); setPending(null); setErrors([]); }} placeholder='<style>...</style> <div>...</div>' className="font-mono text-xs" />
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => {
                const r = parsePastedTemplate(paste, tpl);
                if (r.ok) { setPending(r.data); setErrors([]); } else { setPending(null); setErrors(r.errors); }
              }}>Check template</Button>
              {pending && <Button type="button" size="sm" onClick={() => { onChange(pending); setPending(null); setPaste(""); toast.success("Template applied — Save to put it live"); }}>Apply template</Button>}
            </div>
            {errors.length > 0 && <ul className="text-xs text-destructive list-disc pl-4">{errors.slice(0, 6).map((e) => <li key={e}>{e}</li>)}</ul>}
            {pending && (
              <div className="relative mx-auto h-[420px] w-[260px] overflow-hidden rounded-2xl border">
                <WelcomeScreen campaign={campaign} tpl={pending} preview="mobile" onClose={() => {}} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
