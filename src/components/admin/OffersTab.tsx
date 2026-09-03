import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Sparkles, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { OfferCountdownPill } from "@/components/site/OfferCountdown";

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
  product_ids: [] as string[],
  sale_mode: false,
  accent_color: "",
  priority: 0,
  urgency_text: "",
};


const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
const toLocal = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");

const statusStyle: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-600",
  scheduled: "bg-blue-500/15 text-blue-600",
  expired: "bg-muted text-muted-foreground",
  paused: "bg-amber-500/15 text-amber-600",
};

type AdminProduct = { id: string; name: string; price: number; images: string[] | null };

function useAdminProducts() {
  return useQuery<AdminProduct[]>({
    queryKey: ["admin-offer-products"],
    queryFn: async () =>
      ((await supabase.from("products").select("id,name,price,images").order("name")).data ?? []) as AdminProduct[],
    staleTime: 5 * 60_000,
  });
}

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
          <p className="text-sm text-muted-foreground">Run occasion-based offers (Diwali, Wedding, Navratri…) sitewide, with start countdown and product-wise targeting.</p>
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
                  <OfferCountdownPill campaign={o} />
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">{o.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {o.badge_text ? `${o.badge_text} · ` : ""}{o.coupon_code ? `Code ${o.coupon_code} · ` : ""}
                  {o.starts_at ? new Date(o.starts_at).toLocaleString("en-IN") : "—"} → {o.ends_at ? new Date(o.ends_at).toLocaleString("en-IN") : "—"}
                </div>
                <div className="text-xs mt-1 inline-flex items-center gap-1.5 text-muted-foreground">
                  <Package className="size-3" />
                  {(o.product_ids?.length ?? 0) > 0 ? `${o.product_ids!.length} product(s) targeted` : "All products"}
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
          product_ids: existing.product_ids ?? [],
          sale_mode: !!existing.sale_mode,
          accent_color: existing.accent_color ?? "",
          priority: existing.priority ?? 0,
          urgency_text: existing.urgency_text ?? "",
        }
      : { ...empty },
  );
  const [customOccasion, setCustomOccasion] = useState(() =>
    existing && !OCCASIONS.includes(existing.occasion as never) ? true : false,
  );


  const save = async () => {
    if (!form.name.trim()) { toast.error("Offer name is required"); return; }
    const occasion = form.occasion.trim().toLowerCase().replace(/\s+/g, "-");
    if (!occasion) { toast.error("Occasion is required"); return; }
    const payload = {
      ...form,
      occasion,
      coupon_code: form.coupon_code ? form.coupon_code.toUpperCase() : null,
      banner_url: form.banner_url || null,
      video_url: form.video_url || null,
      video_type: form.video_url ? form.video_type || "link" : null,
      discount_percent: Number(form.discount_percent) || null,
      display_order: Number(form.display_order) || 0,
      starts_at: toIso(form.starts_at),
      ends_at: toIso(form.ends_at),
      product_ids: form.product_ids ?? [],
      sale_mode: !!form.sale_mode,
      accent_color: form.accent_color || null,
      priority: Number(form.priority) || 0,
      urgency_text: form.urgency_text || null,
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
            {customOccasion ? (
              <div className="flex gap-2">
                <Input
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  placeholder="e.g. Ganesh Utsav, Karwa Chauth"
                />
                <Button type="button" variant="outline" onClick={() => { setCustomOccasion(false); setForm({ ...form, occasion: "diwali" }); }}>List</Button>
              </div>
            ) : (
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.occasion}
                onChange={(e) => {
                  if (e.target.value === "__new") { setCustomOccasion(true); setForm({ ...form, occasion: "" }); }
                  else setForm({ ...form, occasion: e.target.value });
                }}
              >
                {OCCASIONS.map((o) => <option key={o} value={o}>{occasionLabel(o)}</option>)}
                <option value="__new">+ Add new occasion…</option>
              </select>
            )}
          </div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Badge text</Label><Input value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} placeholder="UP TO 40% OFF" /></div>
          <div><Label>Discount %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} /></div>
          <div><Label>Linked coupon code</Label><Input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} placeholder="DIWALI20" /></div>
          <div><Label>Link</Label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/shop" /></div>
          <div><Label>Starts</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
          <div><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
          <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>

          <div className="md:col-span-2 rounded-2xl border border-border p-3 grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <div>
                <Label>Sale mode (sitewide sale bar like Flipkart)</Label>
                <p className="text-xs text-muted-foreground">Shows a big sale banner with countdown on every page.</p>
              </div>
              <Switch checked={form.sale_mode} onCheckedChange={(v) => setForm({ ...form, sale_mode: v })} />
            </div>
            <div>
              <Label>Accent colour</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-14 p-1" value={form.accent_color || "#c2410c"} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
                <Input value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} placeholder="#c2410c" />
              </div>
            </div>
            <div><Label>Priority (higher owns the sale bar)</Label><Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></div>
            <div className="md:col-span-2"><Label>Urgency text</Label><Input value={form.urgency_text} onChange={(e) => setForm({ ...form, urgency_text: e.target.value })} placeholder="Hurry! Limited stock" /></div>
          </div>

          <div className="md:col-span-2">
            <Label>Products in this offer (leave empty for all products)</Label>
            <ProductPicker
              selected={form.product_ids}
              onChange={(ids) => setForm({ ...form, product_ids: ids })}
            />
          </div>
        </div>
        <DialogFooter><Button onClick={save} className="rounded-full gradient-festive border-0">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const { data: products = [], isLoading } = useAdminProducts();
  const [q, setQ] = useState("");
  const list = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())),
    [products, q],
  );

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="rounded-2xl border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{selected.length} selected</span>
        {selected.length > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange([])}>Clear</Button>
        )}
      </div>
      {isLoading ? (
        <div className="shimmer h-24 rounded-xl" />
      ) : (
        <div className="max-h-56 overflow-y-auto divide-y divide-border">
          {list.map((p) => (
            <label key={p.id} className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="size-4 accent-primary"
              />
              <div className="size-9 rounded-lg overflow-hidden bg-muted shrink-0">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="size-full object-cover" /> : null}
              </div>
              <span className="text-sm truncate flex-1">{p.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">₹{p.price}</span>
            </label>
          ))}
          {list.length === 0 && <p className="py-3 text-sm text-muted-foreground">No products found.</p>}
        </div>
      )}
    </div>
  );
}
