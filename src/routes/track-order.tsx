import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Package, Search, MapPin, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/cart-store";
import { trackByAwb } from "@/lib/delhivery/shipping.functions";
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
  awb: string | null;
  shipping_status: string | null;
};

type LiveTrack = Awaited<ReturnType<typeof trackByAwb>>;

function TrackPage() {
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [live, setLive] = useState<LiveTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const trackFn = useServerFn(trackByAwb);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLive(null);
    const { data } = await supabase
      .from("orders").select("order_number,status,payment_method,total,created_at,customer_name,awb,shipping_status")
      .eq("order_number", num.trim().toUpperCase()).eq("email", email.trim()).maybeSingle();
    if (!data) { setLoading(false); toast.error("Order not found"); return; }
    setOrder(data as Order);
    if (data.awb) {
      try {
        const l = await trackFn({ data: { awb: data.awb } });
        setLive(l);
      } catch { /* ignore */ }
    }
    setLoading(false);
  };

  const stages = ["pending", "confirmed", "shipped", "delivered"];
  const currentIdx = order ? Math.max(0, stages.indexOf(order.status)) : -1;

  return (
    <SiteLayout>
      <PageHeader title={<>Track Your <span className="gradient-text">Order</span></>} description="Real-time tracking powered by Delhivery." crumbs={[{ to: "/track-order", label: "Track Order" }]} />
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
                {order.awb && <div className="text-xs text-muted-foreground mt-1">AWB: <span className="font-mono text-foreground">{order.awb}</span></div>}
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

            {live && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Live Status</div>
                    <div className="font-display text-lg font-bold text-primary">{live.status}</div>
                    {live.currentLocation && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="size-3" /> {live.currentLocation}</div>}
                  </div>
                  {live.expectedDelivery && (
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Expected</div>
                      <div className="font-semibold">{new Date(live.expectedDelivery).toLocaleDateString("en-IN")}</div>
                    </div>
                  )}
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {live.events.map((ev, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className={`size-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      <div className="flex-1">
                        <div className="font-medium">{ev.status}</div>
                        {ev.remark && <div className="text-xs text-muted-foreground">{ev.remark}</div>}
                        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                          {ev.location && <span className="flex items-center gap-1"><MapPin className="size-3" /> {ev.location}</span>}
                          {ev.time && <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(ev.time).toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!live && order.awb && (
              <div className="mt-6 text-xs text-muted-foreground">Fetching live tracking…</div>
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
