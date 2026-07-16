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
          <section id="orders" className="glass rounded-3xl p-6 shadow-card">
            <h2 className="font-display text-2xl font-bold mb-5">Your Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No orders yet. <Link to="/shop" className="text-primary">Start shopping →</Link></div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center p-4 rounded-2xl bg-background/40 border border-border">
                    <div>
                      <div className="font-display font-bold">{o.order_number}</div>
                      <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {o.payment_method.toUpperCase()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">{o.status}</span>
                      <div className="font-bold text-primary">{formatINR(Number(o.total))}</div>
                    </div>
                  </div>
                ))}
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

