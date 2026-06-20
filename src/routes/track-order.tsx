import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — Ganesha Rangoli" }] }),
  component: TrackPage,
});

type Order = {
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
  customer_name: string;
};

function TrackPage() {
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase
      .from("orders").select("order_number,status,payment_method,total,created_at,customer_name")
      .eq("order_number", num.trim().toUpperCase()).eq("email", email.trim()).maybeSingle();
    setLoading(false);
    if (!data) { toast.error("Order not found"); return; }
    setOrder(data);
  };

  const stages = ["pending", "confirmed", "shipped", "delivered"];
  const currentIdx = order ? Math.max(0, stages.indexOf(order.status)) : -1;

  return (
    <SiteLayout>
      <PageHeader title={<>Track Your <span className="gradient-text">Order</span></>} description="Enter your order number and email to see live status." crumbs={[{ to: "/track-order", label: "Track Order" }]} />
      <div className="container-luxe pb-20 max-w-2xl">
        <form onSubmit={track} className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4">
          <div><label className="text-xs uppercase tracking-wider text-muted-foreground">Order Number</label><Input placeholder="GR250101XXXXX" value={num} onChange={(e) => setNum(e.target.value)} required /></div>
          <div><label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label><Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow"><Search className="size-4 mr-2" /> {loading ? "Searching…" : "Track"}</Button>
        </form>

        {order && (
          <div className="mt-8 glass rounded-3xl p-6 md:p-8 shadow-card">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Order</div>
                <div className="font-display text-2xl font-bold">{order.order_number}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-display text-2xl font-bold text-primary">{formatINR(Number(order.total))}</div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-2">
              {stages.map((s, i) => (
                <div key={s} className="text-center">
                  <div className={`size-10 rounded-full grid place-items-center mx-auto ${i <= currentIdx ? "gradient-festive text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Package className="size-4" />
                  </div>
                  <div className={`text-xs mt-2 font-medium capitalize ${i <= currentIdx ? "text-primary" : "text-muted-foreground"}`}>{s}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-sm text-muted-foreground">
              Payment: <strong className="text-foreground">{order.payment_method.toUpperCase()}</strong> ·
              Placed: <strong className="text-foreground">{new Date(order.created_at).toLocaleString("en-IN")}</strong>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
