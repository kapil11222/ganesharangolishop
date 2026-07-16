import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Package, Heart, MapPin, LogOut, User as UserIcon, Settings, Shield, Truck, CheckCircle2, Clock, XCircle, ChevronRight, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatINR } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Ganesha Rangoli" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, product_image, quantity, unit_price, total)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (loading || !user) {
    return <SiteLayout><div className="container-luxe py-20"><div className="shimmer h-64 rounded-3xl" /></div></SiteLayout>;
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="My Account"
        title={<>Hello, <span className="gradient-text">{user.user_metadata?.full_name?.split(" ")[0] ?? "friend"}</span></>}
        description={user.email ?? ""}
      />
      <div className="container-luxe pb-20 grid lg:grid-cols-4 gap-8">
        <aside className="glass rounded-3xl p-4 h-fit lg:sticky lg:top-28">
          <nav className="space-y-1">
            {[
              { i: UserIcon, l: "Profile", a: "#profile" },
              { i: Package, l: "Orders", a: "#orders" },
              { i: Heart, l: "Wishlist", to: "/wishlist" },
              { i: MapPin, l: "Addresses", a: "#addr" },
              { i: Settings, l: "Settings", a: "#settings" },
            ].map((it) => (
              it.to ? (
                <Link key={it.l} to={it.to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/10 hover:text-primary">
                  <it.i className="size-4" /> {it.l}
                </Link>
              ) : (
                <a key={it.l} href={it.a} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/10 hover:text-primary">
                  <it.i className="size-4" /> {it.l}
                </a>
              )
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-secondary/15 text-secondary-foreground">
                <Shield className="size-4" /> Admin Panel
              </Link>
            )}
            <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="size-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <section id="orders" className="glass rounded-3xl p-6 md:p-7 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">My Orders</h2>
                <div className="text-xs text-muted-foreground mt-0.5">{orders.length} {orders.length === 1 ? "order" : "orders"} total</div>
              </div>
              <Link to="/shop" className="text-xs text-primary font-semibold hover:underline hidden sm:inline">Continue shopping →</Link>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
                <ShoppingBag className="size-10 mx-auto text-muted-foreground mb-3" />
                <div className="font-display text-lg font-bold">No orders yet</div>
                <div className="text-xs text-muted-foreground mt-1">Start exploring our festive collection</div>
                <Link to="/shop" className="inline-block mt-4 px-5 py-2 rounded-full gradient-festive text-primary-foreground text-sm font-semibold shadow-glow">Shop Now</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => {
                  const items = (o.order_items ?? []) as Array<{ id: string; product_name: string; product_image: string | null; quantity: number; unit_price: number; total: number }>;
                  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
                  const st = statusMeta(o.status);
                  const StIcon = st.icon;
                  return (
                    <div key={o.id} className="rounded-2xl border border-border bg-background/50 overflow-hidden hover:shadow-card transition">
                      {/* Header strip */}
                      <div className="flex flex-wrap gap-4 justify-between p-4 bg-muted/30 border-b border-border">
                        <div className="flex flex-wrap gap-6 text-xs">
                          <div>
                            <div className="uppercase tracking-widest text-muted-foreground">Order</div>
                            <div className="font-display font-bold text-sm mt-0.5">{o.order_number}</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-widest text-muted-foreground">Placed</div>
                            <div className="font-semibold text-sm mt-0.5">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-widest text-muted-foreground">Total</div>
                            <div className="font-display font-bold text-sm text-primary mt-0.5">{formatINR(Number(o.total))}</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-widest text-muted-foreground">Payment</div>
                            <div className="font-semibold text-sm mt-0.5">{o.payment_method.toUpperCase()}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold h-fit ${st.cls}`}>
                          <StIcon className="size-3.5" /> {st.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="p-4 space-y-3">
                        {items.slice(0, 3).map((it) => (
                          <div key={it.id} className="flex gap-3 items-center">
                            <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0">
                              {it.product_image ? (
                                <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-muted-foreground"><Package className="size-4" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm line-clamp-1">{it.product_name}</div>
                              <div className="text-xs text-muted-foreground">Qty: {it.quantity} · {formatINR(Number(it.unit_price))}</div>
                            </div>
                            <div className="text-sm font-semibold shrink-0">{formatINR(Number(it.total))}</div>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-xs text-muted-foreground pl-1">+ {items.length - 3} more item{items.length - 3 > 1 ? "s" : ""}</div>
                        )}
                        {items.length === 0 && (
                          <div className="text-xs text-muted-foreground">{itemCount || 1} item(s) in this order</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 p-4 pt-0 border-t border-border/50 mt-2">
                        <Link
                          to="/track-order"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
                        >
                          <Truck className="size-3.5" /> Track Order
                        </Link>
                        {o.awb && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(o.awb!); toast.success("AWB copied"); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted text-xs font-semibold hover:bg-muted/70 transition"
                          >
                            AWB: {o.awb}
                          </button>
                        )}
                        <Link
                          to="/help"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted text-xs font-semibold hover:bg-muted/70 transition ml-auto"
                        >
                          Need help? <ChevronRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>


          <section id="profile" className="glass rounded-3xl p-6 shadow-card">
            <h2 className="font-display text-2xl font-bold mb-5">Profile</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <Info label="Name" value={user.user_metadata?.full_name ?? "—"} />
              <Info label="Email" value={user.email ?? "—"} />
              <Info label="Phone" value={user.user_metadata?.phone ?? "—"} />
              <Info label="Member since" value={new Date(user.created_at).toLocaleDateString("en-IN")} />
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-background/40 border border-border">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}

function statusMeta(status: string) {
  const s = (status ?? "pending").toLowerCase();
  if (s === "delivered") return { label: "Delivered", icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
  if (s === "shipped" || s === "in_transit") return { label: "Shipped", icon: Truck, cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" };
  if (s === "confirmed" || s === "processing") return { label: "Confirmed", icon: CheckCircle2, cls: "bg-primary/15 text-primary" };
  if (s === "cancelled" || s === "canceled") return { label: "Cancelled", icon: XCircle, cls: "bg-destructive/15 text-destructive" };
  return { label: "Pending", icon: Clock, cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
}


