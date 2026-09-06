import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShoppingBag, Users, Package, IndianRupee, Plus, Pencil, Trash2, TrendingUp, MessageSquare, Tag,
  BarChart3, Truck, ExternalLink, RefreshCw, Image as ImageIcon, Sparkles, LayoutDashboard,
  Search, Menu, X, AlertTriangle, Clock, Store, ArrowUpRight,
} from "lucide-react";
import { BannersTab } from "@/components/admin/BannersTab";
import { OffersTab } from "@/components/admin/OffersTab";

import { useServerFn } from "@tanstack/react-start";
import { createOrderShipment, requestPickup, getWaybillUrl } from "@/lib/delhivery/shipping.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  head: () => ({
    meta: [
      { title: "Seller Dashboard — Ganesha Rangoli" },
      { name: "description", content: "Manage orders, products, offers, banners and shipping for Ganesha Rangoli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type AdminOrder = { id: string; order_number: string; status: string; total: number; customer_name: string; mobile: string; payment_method: string; created_at: string };
type AdminProduct = { id: string; name: string; slug: string; price: number; stock: number; is_active: boolean; allow_cod: boolean; allow_prepaid: boolean; category_id: string | null; images: string[]; short_description: string | null; description: string | null; mrp: number | null; festival: string | null; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean };
type AdminTicket = { id: string; ticket_number: string; name: string; email: string; subject: string; category: string; status: string; created_at: string };

type SectionId = "overview" | "orders" | "products" | "categories" | "banners" | "offers" | "tickets" | "coupons" | "shipping" | "analytics";

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard; group: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Business" },
  { id: "orders", label: "Orders", icon: ShoppingBag, group: "Business" },
  { id: "shipping", label: "Shipping", icon: Truck, group: "Business" },
  { id: "products", label: "Products", icon: Package, group: "Catalogue" },
  { id: "categories", label: "Categories", icon: Tag, group: "Catalogue" },
  { id: "offers", label: "Offers", icon: Sparkles, group: "Growth" },
  { id: "banners", label: "Banners", icon: ImageIcon, group: "Growth" },
  { id: "coupons", label: "Coupons", icon: Tag, group: "Growth" },
  { id: "tickets", label: "Support", icon: MessageSquare, group: "Support" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Support" },
];

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const statusPill: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  confirmed: "bg-blue-500/15 text-blue-600",
  shipped: "bg-violet-500/15 text-violet-600",
  delivered: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-destructive/10 text-destructive",
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [section, setSection] = useState<SectionId>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const { data: orders = [] } = useQuery<AdminOrder[]>({
    queryKey: ["admin-orders"], enabled: !!isAdmin,
    queryFn: async () => ((await supabase.from("orders").select("id,order_number,status,total,customer_name,mobile,payment_method,created_at").order("created_at", { ascending: false }).limit(200)).data ?? []) as AdminOrder[],
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
  const { data: subscribers = 0 } = useQuery({
    queryKey: ["admin-subs"], enabled: !!isAdmin,
    queryFn: async () => (await supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true })).count ?? 0,
  });

  const kpi = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const todays = orders.filter((o) => new Date(o.created_at) >= today);
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (6 - i));
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayOrders = orders.filter((o) => { const t = new Date(o.created_at); return t >= d && t < next; });
      return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), value: dayOrders.reduce((s, o) => s + Number(o.total), 0), count: dayOrders.length };
    });
    return {
      revenue,
      todayRevenue: todays.reduce((s, o) => s + Number(o.total), 0),
      todayCount: todays.length,
      ordersCount: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      toShip: orders.filter((o) => o.status === "confirmed").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      aov: orders.length ? Math.round(revenue / orders.length) : 0,
      lowStock: products.filter((p) => p.stock <= 5),
      inactive: products.filter((p) => !p.is_active).length,
      last7,
    };
  }, [orders, products]);

  if (loading) return <SiteLayout><div className="container-luxe py-20"><div className="shimmer h-64 rounded-3xl" /></div></SiteLayout>;
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container-luxe py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Admin access only</h1>
          <p className="text-muted-foreground mt-2">Sign in with an admin account to manage the store.</p>
        </div>
      </SiteLayout>
    );
  }

  const active = NAV.find((n) => n.id === section)!;
  const groups = [...new Set(NAV.map((n) => n.group))];

  const Sidebar = (
    <nav className="p-3 space-y-5">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <span className="size-9 rounded-xl gradient-festive grid place-items-center text-white"><Store className="size-4" /></span>
        <div className="min-w-0">
          <div className="font-display font-bold leading-tight truncate">Seller Panel</div>
          <div className="text-[11px] text-muted-foreground truncate">Ganesha Rangoli</div>
        </div>
      </div>
      {groups.map((g) => (
        <div key={g}>
          <div className="px-3 pb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{g}</div>
          <div className="space-y-1">
            {NAV.filter((n) => n.group === g).map((n) => {
              const on = n.id === section;
              const badge = n.id === "orders" ? kpi.pending : n.id === "shipping" ? kpi.toShip : n.id === "tickets" ? tickets.length : 0;
              return (
                <button
                  key={n.id}
                  onClick={() => { setSection(n.id); setNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${on ? "bg-primary text-primary-foreground font-semibold shadow-card" : "hover:bg-primary/5 text-foreground/80"}`}
                >
                  <n.icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{n.label}</span>
                  {badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${on ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"}`}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <SiteLayout>
      <div className="container-luxe py-6 lg:py-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="glass rounded-3xl shadow-card sticky top-24">{Sidebar}</div>
          </aside>

          {/* Mobile drawer */}
          {navOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-foreground/40" onClick={() => setNavOpen(false)} />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border overflow-y-auto">
                <div className="flex justify-end p-2"><Button size="icon" variant="ghost" onClick={() => setNavOpen(false)} aria-label="Close menu"><X className="size-4" /></Button></div>
                {Sidebar}
              </motion.div>
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-5">
            {/* Top bar */}
            <div className="glass rounded-3xl shadow-card p-3 md:p-4 flex items-center gap-3">
              <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu"><Menu className="size-5" /></Button>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Seller Panel</div>
                <h1 className="font-display text-lg md:text-2xl font-bold leading-tight truncate">{active.label}</h1>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders, products…" className="pl-9 w-48 md:w-64 rounded-full" />
                </div>
                <Button variant="outline" size="icon" className="rounded-full" aria-label="Refresh data" onClick={() => { qc.invalidateQueries(); toast.success("Refreshed"); }}><RefreshCw className="size-4" /></Button>
              </div>
            </div>

            {section === "overview" && (
              <OverviewSection kpi={kpi} orders={orders} subscribers={subscribers} onGo={setSection} />
            )}

            {section === "orders" && <OrdersSection orders={orders} search={search} onChanged={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })} />}

            {section === "products" && (
              <ProductsSection products={products} categories={categories as { id: string; name: string }[]} search={search} qc={qc} />
            )}

            {section === "categories" && <CategoriesTab />}
            {section === "banners" && <BannersTab />}
            {section === "offers" && <OffersTab />}
            {section === "coupons" && <CouponsTab />}
            {section === "shipping" && <ShippingTab />}

            {section === "tickets" && (
              <Panel title="Support tickets" subtitle={`${tickets.length} recent`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead className="text-xs uppercase text-muted-foreground border-b border-border"><tr><th className="text-left p-3">Ticket</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Subject</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr></thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t.id} className="border-b border-border/50 hover:bg-primary/5">
                          <td className="p-3 font-mono">{t.ticket_number}</td>
                          <td className="p-3">{t.name}<div className="text-xs text-muted-foreground">{t.email}</div></td>
                          <td className="p-3">{t.subject}</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{t.category}</span></td>
                          <td className="p-3 capitalize">{t.status}</td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {section === "analytics" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard icon={IndianRupee} label="Total revenue" value={formatINR(kpi.revenue)} tone="text-emerald-500" />
                  <StatCard icon={TrendingUp} label="Avg order value" value={formatINR(kpi.aov)} tone="text-primary" />
                  <StatCard icon={ShoppingBag} label="Delivered" value={String(kpi.delivered)} tone="text-violet-500" />
                  <StatCard icon={Users} label="Subscribers" value={String(subscribers)} tone="text-accent" />
                </div>
                <Panel title="Revenue · last 7 days"><MiniBars data={kpi.last7} /></Panel>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Panel({ title, subtitle, action, children }: { title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl shadow-card p-4 md:p-6">
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            {title && <div className="font-display text-lg font-bold">{title}</div>}
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, hint }: { icon: typeof IndianRupee; label: string; value: string; tone: string; hint?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Icon className={`size-5 ${tone}`} />
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-3">{label}</div>
      <div className="font-display text-xl md:text-2xl font-bold mt-0.5">{value}</div>
    </motion.div>
  );
}

function MiniBars({ data }: { data: { label: string; value: number; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex-1 flex items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
              className="w-full rounded-t-lg gradient-festive min-h-1"
              title={`${d.count} orders · ${formatINR(d.value)}`}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function OverviewSection({ kpi, orders, subscribers, onGo }: { kpi: any; orders: AdminOrder[]; subscribers: number; onGo: (s: SectionId) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={IndianRupee} label="Today's sales" value={formatINR(kpi.todayRevenue)} tone="text-emerald-500" hint={`${kpi.todayCount} orders`} />
        <StatCard icon={Clock} label="Pending orders" value={String(kpi.pending)} tone="text-amber-500" />
        <StatCard icon={Truck} label="Ready to ship" value={String(kpi.toShip)} tone="text-violet-500" />
        <StatCard icon={AlertTriangle} label="Low stock" value={String(kpi.lowStock.length)} tone="text-destructive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Panel title="Revenue · last 7 days" subtitle={`Lifetime ${formatINR(kpi.revenue)} · AOV ${formatINR(kpi.aov)}`}><MiniBars data={kpi.last7} /></Panel>
          <Panel
            title="Latest orders"
            action={<Button variant="ghost" size="sm" className="rounded-full" onClick={() => onGo("orders")}>View all <ArrowUpRight className="size-3.5 ml-1" /></Button>}
          >
            <div className="divide-y divide-border/60">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs font-bold text-primary">{o.order_number}</div>
                    <div className="text-sm truncate">{o.customer_name} · <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</span></div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${statusPill[o.status] ?? "bg-muted"}`}>{o.status}</span>
                  <div className="font-bold text-sm">{formatINR(Number(o.total))}</div>
                </div>
              ))}
              {orders.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No orders yet.</div>}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Quick actions">
            <div className="grid gap-2">
              <Button variant="outline" className="rounded-full justify-start" onClick={() => onGo("products")}><Package className="size-4 mr-2" /> Add / edit products</Button>
              <Button variant="outline" className="rounded-full justify-start" onClick={() => onGo("offers")}><Sparkles className="size-4 mr-2" /> Run an offer campaign</Button>
              <Button variant="outline" className="rounded-full justify-start" onClick={() => onGo("banners")}><ImageIcon className="size-4 mr-2" /> Update home banners</Button>
              <Button variant="outline" className="rounded-full justify-start" onClick={() => onGo("shipping")}><Truck className="size-4 mr-2" /> Ship & schedule pickup</Button>
            </div>
          </Panel>
          <Panel title="Needs attention">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Hidden products</span><span className="font-semibold">{kpi.inactive}</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Newsletter subscribers</span><span className="font-semibold">{subscribers}</span></li>
            </ul>
            {kpi.lowStock.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Low stock items</div>
                {kpi.lowStock.slice(0, 5).map((p: AdminProduct) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="text-destructive font-semibold">{p.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function OrdersSection({ orders, search, onChanged }: { orders: AdminOrder[]; search: string; onChanged: () => void }) {
  const [filter, setFilter] = useState<string>("all");
  const q = search.trim().toLowerCase();
  const rows = orders.filter((o) =>
    (filter === "all" || o.status === filter) &&
    (!q || o.order_number.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.mobile.includes(q)),
  );
  return (
    <Panel title="Orders" subtitle={`${rows.length} shown`} action={
      <div className="flex gap-1.5 flex-wrap">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs capitalize border transition ${filter === s ? "bg-primary text-primary-foreground border-primary font-semibold" : "border-border hover:bg-primary/5"}`}>{s}</button>
        ))}
      </div>
    }>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Payment</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-primary/5">
                <td className="p-3 font-mono font-bold text-primary">{o.order_number}</td>
                <td className="p-3">{o.customer_name}<div className="text-xs text-muted-foreground">{o.mobile}</div></td>
                <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                <td className="p-3 font-bold">{formatINR(Number(o.total))}</td>
                <td className="p-3">
                  <select defaultValue={o.status} onChange={async (e) => {
                    await supabase.from("orders").update({ status: e.target.value }).eq("id", o.id);
                    toast.success("Status updated");
                    onChanged();
                  }} className="rounded-full px-3 py-1 text-xs bg-background border border-input capitalize">
                    {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders match this view.</td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ProductsSection({ products, categories, search, qc }: { products: AdminProduct[]; categories: { id: string; name: string }[]; search: string; qc: ReturnType<typeof useQueryClient> }) {
  const [tab, setTab] = useState<"all" | "live" | "hidden" | "low">("all");
  const q = search.trim().toLowerCase();
  const rows = products.filter((p) =>
    (tab === "all" || (tab === "live" && p.is_active) || (tab === "hidden" && !p.is_active) || (tab === "low" && p.stock <= 5)) &&
    (!q || p.name.toLowerCase().includes(q)),
  );
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-products"] });
  return (
    <Panel title="Products" subtitle={`${rows.length} of ${products.length}`} action={
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "live", "hidden", "low"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-xs capitalize border transition ${tab === t ? "bg-primary text-primary-foreground border-primary font-semibold" : "border-border hover:bg-primary/5"}`}>{t === "low" ? "Low stock" : t}</button>
        ))}
        <ProductDialog categories={categories} onSaved={refresh} />
      </div>
    }>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">COD</th><th className="text-left p-3">Prepaid</th><th className="text-left p-3">Live</th><th className="text-left p-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-primary/5">
                <td className="p-3"><div className="flex items-center gap-3"><img src={p.images?.[0]} alt="" className="size-10 rounded-lg object-cover bg-muted" /><span className="font-semibold">{p.name}</span></div></td>
                <td className="p-3 font-bold">{formatINR(Number(p.price))}</td>
                <td className="p-3"><span className={p.stock <= 5 ? "text-destructive font-semibold" : ""}>{p.stock}</span></td>
                <td className="p-3">{p.allow_cod ? "✓" : "—"}</td>
                <td className="p-3">{p.allow_prepaid ? "✓" : "—"}</td>
                <td className="p-3">
                  <Switch checked={p.is_active} onCheckedChange={async (v) => {
                    await supabase.from("products").update({ is_active: v }).eq("id", p.id);
                    refresh();
                  }} />
                </td>
                <td className="p-3"><div className="flex gap-1">
                  <ProductDialog categories={categories} existing={p} onSaved={refresh} />
                  <Button size="icon" variant="ghost" onClick={async () => {
                    if (!confirm(`Delete ${p.name}?`)) return;
                    await supabase.from("products").delete().eq("id", p.id);
                    toast.success("Deleted");
                    refresh();
                  }}><Trash2 className="size-4 text-destructive" /></Button>
                </div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products match this view.</td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
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
