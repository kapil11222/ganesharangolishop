import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string;
  mobile_image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

const empty = {
  title: "",
  subtitle: "",
  eyebrow: "",
  image_url: "",
  mobile_image_url: "",
  cta_label: "Shop Now",
  cta_link: "/shop",
  display_order: 0,
  starts_at: "",
  ends_at: "",
};

const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
const toLocal = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");

export function BannersTab() {
  const qc = useQueryClient();
  const { data: slides = [], isLoading } = useQuery<Slide[]>({
    queryKey: ["admin-hero-slides"],
    queryFn: async () =>
      ((await supabase.from("hero_slides").select("*").order("display_order")).data ?? []) as Slide[],
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    qc.invalidateQueries({ queryKey: ["hero-slides"] });
  };

  const move = async (s: Slide, dir: -1 | 1) => {
    const sorted = [...slides].sort((a, b) => a.display_order - b.display_order);
    const i = sorted.findIndex((x) => x.id === s.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    await supabase.from("hero_slides").update({ display_order: sorted[j].display_order }).eq("id", s.id);
    await supabase.from("hero_slides").update({ display_order: s.display_order }).eq("id", sorted[j].id);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Banner deleted"); refresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl font-bold">Homepage Slider</h3>
          <p className="text-sm text-muted-foreground">Upload banners shown in the homepage carousel.</p>
        </div>
        <SlideDialog onSaved={refresh} />
      </div>

      {isLoading && <div className="shimmer h-40 rounded-3xl" />}

      {!isLoading && slides.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center">
          <ImageIcon className="size-8 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No banners yet. Add your first slider image.</p>
        </div>
      )}

      <div className="grid gap-4">
        {slides.map((s) => (
          <div key={s.id} className="glass rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-card">
            <div className="w-full md:w-56 aspect-[16/7] rounded-2xl overflow-hidden bg-muted shrink-0 border border-border">
              {s.image_url ? <img src={s.image_url} alt={s.title ?? "Banner"} className="size-full object-cover" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg font-bold truncate">{s.title || "Untitled banner"}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">{s.subtitle}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Order {s.display_order} · CTA: {s.cta_label || "—"} → {s.cta_link || "—"}
                {s.starts_at || s.ends_at ? ` · ${s.starts_at ? new Date(s.starts_at).toLocaleDateString("en-IN") : "…"} – ${s.ends_at ? new Date(s.ends_at).toLocaleDateString("en-IN") : "…"}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch
                checked={s.is_active}
                onCheckedChange={async (v) => {
                  await supabase.from("hero_slides").update({ is_active: v }).eq("id", s.id);
                  refresh();
                }}
              />
              <Button size="icon" variant="ghost" onClick={() => move(s, -1)} aria-label="Move up"><ArrowUp className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(s, 1)} aria-label="Move down"><ArrowDown className="size-4" /></Button>
              <SlideDialog existing={s} onSaved={refresh} />
              <Button size="icon" variant="ghost" onClick={() => remove(s.id)} aria-label="Delete banner"><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideDialog({ existing, onSaved }: { existing?: Slide; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() =>
    existing
      ? {
          title: existing.title ?? "",
          subtitle: existing.subtitle ?? "",
          eyebrow: existing.eyebrow ?? "",
          image_url: existing.image_url ?? "",
          mobile_image_url: existing.mobile_image_url ?? "",
          cta_label: existing.cta_label ?? "",
          cta_link: existing.cta_link ?? "",
          display_order: existing.display_order,
          starts_at: toLocal(existing.starts_at),
          ends_at: toLocal(existing.ends_at),
        }
      : { ...empty },
  );

  const save = async () => {
    if (!form.image_url) { toast.error("Please upload a banner image"); return; }
    const payload = {
      ...form,
      display_order: Number(form.display_order) || 0,
      mobile_image_url: form.mobile_image_url || null,
      starts_at: toIso(form.starts_at),
      ends_at: toIso(form.ends_at),
    };
    const { error } = existing
      ? await supabase.from("hero_slides").update(payload).eq("id", existing.id)
      : await supabase.from("hero_slides").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(existing ? "Banner updated" : "Banner added"); setOpen(false); onSaved(); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing
          ? <Button size="icon" variant="ghost" aria-label="Edit banner"><Pencil className="size-4" /></Button>
          : <Button className="rounded-full gradient-festive border-0"><Plus className="size-4 mr-2" /> Add Banner</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-2xl">{existing ? "Edit" : "New"} Banner</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Desktop image (wide, e.g. 1920×720)</Label>
            <ImageUpload bucket="banner-images" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v as string })} label="Upload" />
          </div>
          <div className="md:col-span-2">
            <Label>Mobile image (optional, square-ish)</Label>
            <ImageUpload bucket="banner-images" value={form.mobile_image_url} onChange={(v) => setForm({ ...form, mobile_image_url: v as string })} label="Upload" />
          </div>
          <div><Label>Eyebrow</Label><Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="Diwali Sale" /></div>
          <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
          <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Subtitle</Label><Textarea rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div><Label>Button text</Label><Input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} /></div>
          <div><Label>Button link</Label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/shop" /></div>
          <div><Label>Starts (optional)</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
          <div><Label>Ends (optional)</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
        </div>
        <DialogFooter><Button onClick={save} className="rounded-full gradient-festive border-0">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
