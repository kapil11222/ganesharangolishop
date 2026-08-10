import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, Users, Package, IndianRupee, Plus, Pencil, Trash2, TrendingUp, MessageSquare, Tag, Star, BarChart3, Truck, ExternalLink, RefreshCw, Image as ImageIcon, Sparkles } from "lucide-react";
import { BannersTab } from "@/components/admin/BannersTab";
import { OffersTab } from "@/components/admin/OffersTab";

import { useServerFn } from "@tanstack/react-start";
import { createOrderShipment, requestPickup, getWaybillUrl } from "@/lib/delhivery/shipping.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MediaUpload } from "@/components/admin/MediaUpload";

import { formatINR } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Ganesha Rangoli" }] }),
  component: AdminPage,
});

type AdminOrder = { id: string; order_number: string; status: string; total: number; customer_name: string; mobile: string; payment_method: string; created_at: string };
type AdminProduct = { id: string; name: string; slug: string; price: number; stock: number; is_active: boolean; allow_cod: boolean; allow_prepaid: boolean; category_id: string | null; images: string[]; short_description: string | null; description: string | null; mrp: number | null; festival: string | null; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean };
type AdminTicket = { id: string; ticket_number: string; name: string; email: string; subject: string; category: string; status: string; created_at: string };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const [orders, products, tickets, newsletter] = await Promise.all([
        supabase.from("orders").select("total, status", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      ]);
      const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total), 0);
      return {
        ordersCount: orders.count ?? 0,
        revenue,
        productsCount: products.count ?? 0,
        ticketsCount: tickets.count ?? 0,
        newsletterCount: newsletter.count ?? 0,
        pending: (orders.data ?? []).filter((o) => o.status === "pending").length,
      };
    },
  });

  const { data: orders = [] } = useQuery<AdminOrder[]>({
    queryKey: ["admin-orders"], enabled: !!isAdmin,
    queryFn: async () => ((await supabase.from("orders").select("id,order_number,status,total,customer_name,mobile,payment_method,created_at").order("created_at", { ascending: false }).limit(50)).data ?? []) as AdminOrder[],
  });
  const { data: products = [] } = useQuery<AdminProduct[]>({
    queryKey: ["admin-products"], enabled: !!isAdmin,
    queryFn: async () => ((await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? []) as AdminProduct[],
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-cats"], enabled: !!isAdmin,
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });
  const { data: tickets = [] } = useQuery<AdminTicket[]>({
    queryKey: ["admin-tickets"], enabled: !!isAdmin,
    queryFn: async () => ((await supabase.from("support_tickets").select("id,ticket_number,name,email,subject,category,status,created_at").order("created_at", { ascending: false }).limit(50)).data ?? []) as AdminTicket[],
  });

  if (loading) return <SiteLayout><div className="container-luxe py-20"><div className="shimmer h-64 rounded-3xl" /></div></SiteLayout>;
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container-luxe py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Admin access only</h1>
          <p className="text-muted-foreground mt-2">Sign in with an admin account to manage the store.</p>
          <p className="text-xs text-muted-foreground mt-4 max-w-md mx-auto">To create an admin: insert a row into <code>user_roles</code> with your user_id and role <code>admin</code> via the Supabase SQL editor.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Control center" title={<>Admin <span className="gradient-text">Dashboard</span></>} description="Manage products, orders, customers and the entire storefront." />
      <div className="container-luxe pb-20 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { i: IndianRupee, l: "Revenue", v: formatINR(stats?.revenue ?? 0), color: "text-emerald-500" },
            { i: ShoppingBag, l: "Orders", v: <AnimatedCounter to={stats?.ordersCount ?? 0} />, color: "text-primary" },
            { i: Package, l: "Products", v: <AnimatedCounter to={stats?.productsCount ?? 0} />, color: "text-secondary" },
            { i: Users, l: "Newsletter", v: <AnimatedCounter to={stats?.newsletterCount ?? 0} />, color: "text-accent" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-3xl p-5 shadow-card">
              <s.i className={`size-6 ${s.color}`} />
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-3">{s.l}</div>
              <div className="font-display text-2xl font-bold mt-1">{s.v}</div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="glass flex-wrap h-auto">
            <TabsTrigger value="orders"><ShoppingBag className="size-4 mr-2" /> Orders</TabsTrigger>
            <TabsTrigger value="products"><Package className="size-4 mr-2" /> Products</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="size-4 mr-2" /> Categories</TabsTrigger>
            <TabsTrigger value="banners"><ImageIcon className="size-4 mr-2" /> Banners</TabsTrigger>
            <TabsTrigger value="offers"><Sparkles className="size-4 mr-2" /> Offers</TabsTrigger>
            <TabsTrigger value="tickets"><MessageSquare className="size-4 mr-2" /> Tickets</TabsTrigger>
            <TabsTrigger value="coupons"><Tag className="size-4 mr-2" /> Coupons</TabsTrigger>
            <TabsTrigger value="shipping"><Truck className="size-4 mr-2" /> Shipping</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="size-4 mr-2" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="banners"><BannersTab /></TabsContent>
          <TabsContent value="offers"><OffersTab /></TabsContent>

          <TabsContent value="orders">

            <div className="glass rounded-3xl p-4 md:p-6 shadow-card overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Payment</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-primary/5">
                      <td className="p-3 font-mono font-bold text-primary">{o.order_number}</td>
                      <td className="p-3">{o.customer_name}<div className="text-xs text-muted-foreground">{o.mobile}</div></td>
                      <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                      <td className="p-3 font-bold">{formatINR(Number(o.total))}</td>
                      <td className="p-3">
                        <select defaultValue={o.status} onChange={async (e) => {
                          await supabase.from("orders").update({ status: e.target.value }).eq("id", o.id);
                          toast.success("Status updated");
                          qc.invalidateQueries({ queryKey: ["admin-orders"] });
                        }} className="rounded-full px-3 py-1 text-xs bg-background border border-input">
                          {["pending","confirmed","shipped","delivered","cancelled"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex justify-end mb-3">
              <ProductDialog categories={categories} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />
            </div>
            <div className="glass rounded-3xl p-4 md:p-6 shadow-card overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">COD</th><th className="text-left p-3">Prepaid</th><th className="text-left p-3">Active</th><th className="text-left p-3">Actions</th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="p-3 flex items-center gap-3"><img src={p.images[0]} alt="" className="size-10 rounded-lg object-cover" /><span className="font-semibold">{p.name}</span></td>
                      <td className="p-3 font-bold">{formatINR(Number(p.price))}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3">{p.allow_cod ? "✓" : "—"}</td>
                      <td className="p-3">{p.allow_prepaid ? "✓" : "—"}</td>
                      <td className="p-3">
                        <Switch checked={p.is_active} onCheckedChange={async (v) => {
                          await supabase.from("products").update({ is_active: v }).eq("id", p.id);
                          qc.invalidateQueries({ queryKey: ["admin-products"] });
                        }} />
                      </td>
                      <td className="p-3 flex gap-1">
                        <ProductDialog categories={categories} existing={p} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />
                        <Button size="icon" variant="ghost" onClick={async () => {
                          if (!confirm(`Delete ${p.name}?`)) return;
                          await supabase.from("products").delete().eq("id", p.id);
                          toast.success("Deleted");
                          qc.invalidateQueries({ queryKey: ["admin-products"] });
                        }}><Trash2 className="size-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="glass rounded-3xl p-4 md:p-6 shadow-card overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border"><tr><th className="text-left p-3">Ticket</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Subject</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr></thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="p-3 font-mono">{t.ticket_number}</td>
                      <td className="p-3">{t.name}<div className="text-xs text-muted-foreground">{t.email}</div></td>
                      <td className="p-3">{t.subject}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{t.category}</span></td>
                      <td className="p-3">{t.status}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsTab />
          </TabsContent>

          <TabsContent value="shipping">
            <ShippingTab />
          </TabsContent>



          <TabsContent value="analytics">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-3xl p-6"><TrendingUp className="size-6 text-emerald-500" /><div className="text-xs uppercase text-muted-foreground mt-3">Pending Orders</div><div className="font-display text-3xl font-bold mt-1">{stats?.pending ?? 0}</div></div>
              <div className="glass rounded-3xl p-6"><MessageSquare className="size-6 text-primary" /><div className="text-xs uppercase text-muted-foreground mt-3">Open Tickets</div><div className="font-display text-3xl font-bold mt-1">{stats?.ticketsCount ?? 0}</div></div>
              <div className="glass rounded-3xl p-6"><Star className="size-6 text-secondary" /><div className="text-xs uppercase text-muted-foreground mt-3">Avg Order Value</div><div className="font-display text-3xl font-bold mt-1">{formatINR(stats?.ordersCount ? Math.round((stats.revenue) / stats.ordersCount) : 0)}</div></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

function ProductDialog({ existing, categories, onSaved }: { existing?: AdminProduct; categories: { id: string; name: string }[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    slug: existing?.slug ?? "",
    description: existing?.description ?? "",
    short_description: existing?.short_description ?? "",
    price: existing?.price ?? 0,
    mrp: existing?.mrp ?? 0,
    stock: existing?.stock ?? 0,
    category_id: existing?.category_id ?? (categories[0]?.id ?? ""),
    images: (existing?.images ?? []) as string[],
    video_url: (existing as any)?.video_url ?? "",
    video_type: (existing as any)?.video_type ?? "",
    festival: existing?.festival ?? "",
    allow_cod: existing?.allow_cod ?? true,
    allow_prepaid: existing?.allow_prepaid ?? true,
    is_featured: existing?.is_featured ?? false,
    is_new_arrival: existing?.is_new_arrival ?? false,
    is_best_seller: existing?.is_best_seller ?? false,
  }));
  const save = async () => {
    const payload = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      price: Number(form.price),
      mrp: Number(form.mrp) || null,
      stock: Number(form.stock),
      images: form.images,
      video_url: form.video_url || null,
      video_type: form.video_url ? form.video_type || "link" : null,
    };

    const op = existing
      ? supabase.from("products").update(payload).eq("id", existing.id)
      : supabase.from("products").insert(payload);
    const { error } = await op;
    if (error) toast.error(error.message);
    else { toast.success(existing ? "Updated" : "Created"); setOpen(false); onSaved(); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing
          ? <Button size="icon" variant="ghost"><Pencil className="size-4" /></Button>
          : <Button className="rounded-full gradient-festive border-0"><Plus className="size-4 mr-2" /> Add Product</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-2xl">{existing ? "Edit" : "New"} Product</DialogTitle></DialogHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" /></div>
          <div><Label>Festival</Label><Input value={form.festival} onChange={(e) => setForm({ ...form, festival: e.target.value })} /></div>
          <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
          <div><Label>MRP (₹)</Label><Input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} /></div>
          <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
          <div><Label>Category</Label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><Label>Short description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="md:col-span-2">
            <Label>Product Images</Label>
            <ImageUpload
              bucket="product-images"
              multiple
              value={form.images}
              onChange={(v) => setForm({ ...form, images: v as string[] })}
              label="Add photos"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Product video (optional — YouTube link or MP4 upload)</Label>
            <MediaUpload
              value={form.video_url}
              type={form.video_type}
              onChange={(v) => setForm({ ...form, ...v })}
              label="Product video"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <label className="flex items-center gap-2"><Checkbox checked={form.allow_cod} onCheckedChange={(v) => setForm({ ...form, allow_cod: !!v })} /> Allow COD</label>
            <label className="flex items-center gap-2"><Checkbox checked={form.allow_prepaid} onCheckedChange={(v) => setForm({ ...form, allow_prepaid: !!v })} /> Allow Prepaid</label>
            <label className="flex items-center gap-2"><Checkbox checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: !!v })} /> Featured</label>
            <label className="flex items-center gap-2"><Checkbox checked={form.is_new_arrival} onCheckedChange={(v) => setForm({ ...form, is_new_arrival: !!v })} /> New Arrival</label>
            <label className="flex items-center gap-2"><Checkbox checked={form.is_best_seller} onCheckedChange={(v) => setForm({ ...form, is_best_seller: !!v })} /> Best Seller</label>
          </div>
        </div>
        <DialogFooter><Button onClick={save} className="rounded-full gradient-festive border-0">Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CouponsTab() {
  const qc = useQueryClient();
  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 10, min_order_value: 0, usage_limit: 100 });
  const create = async () => {
    const { error } = await supabase.from("coupons").insert({ ...form, code: form.code.toUpperCase() });
    if (error) toast.error(error.message);
    else { toast.success("Coupon created"); qc.invalidateQueries({ queryKey: ["admin-coupons"] }); setForm({ code: "", discount_type: "percentage", discount_value: 10, min_order_value: 0, usage_limit: 100 }); }
  };
  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 grid md:grid-cols-6 gap-3 items-end">
        <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div><Label>Type</Label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="percentage">%</option><option value="flat">Flat ₹</option></select></div>
        <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} /></div>
        <div><Label>Min Order</Label><Input type="number" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })} /></div>
        <div><Label>Usage Limit</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} /></div>
        <Button onClick={create} className="rounded-full gradient-festive border-0"><Plus className="size-4 mr-2" /> Add</Button>
      </div>
      <div className="glass rounded-3xl p-4 md:p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">Discount</th><th className="text-left p-3">Min Order</th><th className="text-left p-3">Used</th><th className="text-left p-3">Active</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="p-3 font-mono font-bold text-primary">{c.code}</td>
                <td className="p-3">{c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                <td className="p-3">₹{c.min_order_value ?? 0}</td>
                <td className="p-3">{c.used_count} / {c.usage_limit ?? "∞"}</td>
                <td className="p-3"><Switch checked={c.is_active} onCheckedChange={async (v) => {
                  await supabase.from("coupons").update({ is_active: v }).eq("id", c.id);
                  qc.invalidateQueries({ queryKey: ["admin-coupons"] });
                }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery<{ id: string; name: string; slug: string; description: string | null; image_url: string | null; display_order: number }[]>({
    queryKey: ["admin-categories-full"],
    queryFn: async () => ((await supabase.from("categories").select("*").order("display_order")).data ?? []) as any,
  });
  const [form, setForm] = useState({ name: "", slug: "", description: "", image_url: "", display_order: 0 });
  const reset = () => setForm({ name: "", slug: "", description: "", image_url: "", display_order: 0 });
  const create = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("categories").insert({ ...form, slug });
    if (error) toast.error(error.message);
    else { toast.success("Category added"); reset(); qc.invalidateQueries({ queryKey: ["admin-categories-full"] }); qc.invalidateQueries({ queryKey: ["admin-cats"] }); }
  };
  const updateImage = async (id: string, url: string) => {
    await supabase.from("categories").update({ image_url: url || null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-categories-full"] });
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };
  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete category ${name}?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-categories-full"] }); qc.invalidateQueries({ queryKey: ["admin-cats"] }); }
  };
  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="font-display text-lg font-bold">Add Category</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" /></div>
            <div><Label>Display order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div>
            <Label>Image</Label>
            <ImageUpload bucket="category-images" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v as string })} label="Upload" />
          </div>
        </div>
        <div><Button onClick={create} className="rounded-full gradient-festive border-0"><Plus className="size-4 mr-2" /> Add Category</Button></div>
      </div>

      <div className="glass rounded-3xl p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">/{c.slug}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(c.id, c.name)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
              <ImageUpload
                bucket="category-images"
                value={c.image_url ?? ""}
                onChange={(v) => updateImage(c.id, v as string)}
                label="Change"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShippingTab() {
  const qc = useQueryClient();
  const createShip = useServerFn(createOrderShipment);
  const doPickup = useServerFn(requestPickup);
  const getSlip = useServerFn(getWaybillUrl);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-shipping-orders"],
    queryFn: async () => (await supabase.from("orders")
      .select("id,order_number,customer_name,city,state,pincode,payment_method,total,status,awb,shipping_status,created_at")
      .order("created_at", { ascending: false }).limit(100)).data ?? [],
  });

  const [busy, setBusy] = useState<string | null>(null);
  const [pickup, setPickup] = useState({ date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: "14:00:00", count: 1 });
  const [scheduling, setScheduling] = useState(false);

  const generateAwb = async (orderId: string) => {
    setBusy(orderId);
    try {
      const r = await createShip({ data: { orderId, weightGrams: 500 } });
      toast.success(r.alreadyExists ? `AWB exists: ${r.awb}` : `AWB generated: ${r.awb}`);
      qc.invalidateQueries({ queryKey: ["admin-shipping-orders"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(null); }
  };

  const openSlip = async (awb: string) => {
    try {
      const { url } = await getSlip({ data: { awb } });
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const schedule = async () => {
    setScheduling(true);
    try {
      const r = await doPickup({ data: { pickupDate: pickup.date, pickupTime: pickup.time, expectedCount: pickup.count } });
      toast.success(r.success ? `Pickup scheduled #${r.pickupId ?? ""}` : "Pickup requested");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setScheduling(false); }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 grid md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-4 grid md:grid-cols-3 gap-3">
          <div><Label>Pickup date</Label><Input type="date" value={pickup.date} onChange={(e) => setPickup({ ...pickup, date: e.target.value })} /></div>
          <div><Label>Pickup time</Label><Input type="time" step={1} value={pickup.time} onChange={(e) => setPickup({ ...pickup, time: e.target.value.length === 5 ? e.target.value + ":00" : e.target.value })} /></div>
          <div><Label>Expected packages</Label><Input type="number" min={1} value={pickup.count} onChange={(e) => setPickup({ ...pickup, count: Number(e.target.value) })} /></div>
        </div>
        <Button onClick={schedule} disabled={scheduling} className="rounded-full gradient-festive border-0"><Truck className="size-4 mr-2" /> {scheduling ? "Scheduling…" : "Schedule Pickup"}</Button>
      </div>

      <div className="glass rounded-3xl p-4 md:p-6 shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Destination</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">AWB / Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-primary/5">
                <td className="p-3 font-mono font-bold text-primary">{o.order_number}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3 text-xs">{o.city}, {o.state}<div className="text-muted-foreground">{o.pincode}</div></td>
                <td className="p-3 uppercase text-xs">{o.payment_method} · {formatINR(Number(o.total))}</td>
                <td className="p-3">
                  {o.awb
                    ? <div><div className="font-mono text-xs">{o.awb}</div><div className="text-xs text-muted-foreground capitalize">{o.shipping_status ?? "manifested"}</div></div>
                    : <span className="text-xs text-muted-foreground">Not shipped</span>}
                </td>
                <td className="p-3 flex gap-2">
                  {!o.awb
                    ? <Button size="sm" disabled={busy === o.id} onClick={() => generateAwb(o.id)} className="rounded-full gradient-festive border-0">
                        {busy === o.id ? <RefreshCw className="size-3 mr-1 animate-spin" /> : <Truck className="size-3 mr-1" />} Generate AWB
                      </Button>
                    : <Button size="sm" variant="outline" onClick={() => openSlip(o.awb)} className="rounded-full">
                        <ExternalLink className="size-3 mr-1" /> Waybill
                      </Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
