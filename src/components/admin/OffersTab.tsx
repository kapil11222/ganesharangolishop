import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { OCCASIONS, occasionLabel, campaignStatus, type OfferCampaign } from "@/lib/offers";
import { toast } from "sonner";

const empty = {
  name: "",
  occasion: "diwali",
  description: "",
  badge_text: "UP TO 30% OFF",
  banner_url: "",
  video_url: "",
  video_type: "",
  coupon_code: "",
  discount_percent: 0,
  cta_link: "/shop",
  display_order: 0,
  starts_at: "",
  ends_at: "",
};


const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
const toLocal = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");

const statusStyle: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-600",
  scheduled: "bg-blue-500/15 text-blue-600",
  expired: "bg-muted text-muted-foreground",
  paused: "bg-amber-500/15 text-amber-600",
};

export function OffersTab() {
  const qc = useQueryClient();
  const { data: offers = [], isLoading } = useQuery<OfferCampaign[]>({
    queryKey: ["admin-offer-campaigns"],
    queryFn: async () =>
      ((await supabase.from("offer_campaigns").select("*").order("display_order")).data ?? []) as OfferCampaign[],
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-offer-campaigns"] });
    qc.invalidateQueries({ queryKey: ["offer-campaigns"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("offer_campaigns").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Offer deleted"); refresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-xl font-bold">Offer Campaigns</h3>
          <p className="text-sm text-muted-foreground">Run occasion-based offers (Diwali, Wedding, Navratri…) on the Offers page.</p>
        </div>
        <OfferDialog onSaved={refresh} />
      </div>

      {isLoading && <div className="shimmer h-40 rounded-3xl" />}

      {!isLoading && offers.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center">
          <Sparkles className="size-8 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No offer campaigns yet. Create your first festive offer.</p>
        </div>
      )}

      <div className="grid gap-4">
        {offers.map((o) => {
          const st = campaignStatus(o);
          return (
            <div key={o.id} className="glass rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-card">
              <div className="w-full md:w-48 aspect-[16/7] rounded-2xl overflow-hidden bg-muted shrink-0 border border-border">
                {o.banner_url ? <img src={o.banner_url} alt={o.name} className="size-full object-cover" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-lg font-bold truncate">{o.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold ${statusStyle[st]}`}>{st}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wide font-semibold">{occasionLabel(o.occasion)}</span>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">{o.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {o.badge_text ? `${o.badge_text} · ` : ""}{o.coupon_code ? `Code ${o.coupon_code} · ` : ""}
                  {o.starts_at ? new Date(o.starts_at).toLocaleDateString("en-IN") : "—"} → {o.ends_at ? new Date(o.ends_at).toLocaleDateString("en-IN") : "—"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={o.is_active}
                  onCheckedChange={async (v) => {
                    await supabase.from("offer_campaigns").update({ is_active: v }).eq("id", o.id);
                    refresh();
                  }}
                />
                <OfferDialog existing={o} onSaved={refresh} />
                <Button size="icon" variant="ghost" onClick={() => remove(o.id)} aria-label="Delete offer"><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfferDialog({ existing, onSaved }: { existing?: OfferCampaign; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() =>
    existing
      ? {
          name: existing.name,
          occasion: existing.occasion,
          description: existing.description ?? "",
          badge_text: existing.badge_text ?? "",
          banner_url: existing.banner_url ?? "",
          video_url: existing.video_url ?? "",
          video_type: existing.video_type ?? "",
          coupon_code: existing.coupon_code ?? "",
          discount_percent: existing.discount_percent ?? 0,
          cta_link: existing.cta_link ?? "",
          display_order: existing.display_order,
          starts_at: toLocal(existing.starts_at),
          ends_at: toLocal(existing.ends_at),
        }
      : { ...empty },
  );


  const save = async () => {
    if (!form.name.trim()) { toast.error("Offer name is required"); return; }
    const payload = {
      ...form,
      coupon_code: form.coupon_code ? form.coupon_code.toUpperCase() : null,
      banner_url: form.banner_url || null,
      video_url: form.video_url || null,
      video_type: form.video_url ? form.video_type || "link" : null,
      discount_percent: Number(form.discount_percent) || null,
      display_order: Number(form.display_order) || 0,
      starts_at: toIso(form.starts_at),
      ends_at: toIso(form.ends_at),
    };

    const { error } = existing
      ? await supabase.from("offer_campaigns").update(payload).eq("id", existing.id)
      : await supabase.from("offer_campaigns").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(existing ? "Offer updated" : "Offer created"); setOpen(false); onSaved(); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing
          ? <Button size="icon" variant="ghost" aria-label="Edit offer"><Pencil className="size-4" /></Button>
          : <Button className="rounded-full gradient-festive border-0"><Plus className="size-4 mr-2" /> Add Offer</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-2xl">{existing ? "Edit" : "New"} Offer</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Offer banner</Label>
            <ImageUpload bucket="banner-images" value={form.banner_url} onChange={(v) => setForm({ ...form, banner_url: v as string })} label="Upload" />
          </div>
          <div className="md:col-span-2">
            <Label>Offer video (optional — YouTube link or MP4 upload)</Label>
            <MediaUpload
              value={form.video_url}
              type={form.video_type}
              onChange={(v) => setForm({ ...form, ...v })}
              label="Offer video"
            />
          </div>

          <div><Label>Offer name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Diwali Dhamaka Sale" /></div>
          <div>
            <Label>Occasion</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
              {OCCASIONS.map((o) => <option key={o} value={o}>{occasionLabel(o)}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Badge text</Label><Input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} placeholder="UP TO 40% OFF" /></div>
          <div><Label>Discount %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} /></div>
          <div><Label>Linked coupon code</Label><Input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} placeholder="DIWALI20" /></div>
          <div><Label>Link</Label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/shop" /></div>
          <div><Label>Starts</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
          <div><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
          <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
        </div>
        <DialogFooter><Button onClick={save} className="rounded-full gradient-festive border-0">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
