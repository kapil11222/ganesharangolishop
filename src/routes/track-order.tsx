import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Package, Search, MapPin, Clock, CheckCircle2, Truck, Home, ClipboardCheck, Copy, Phone } from "lucide-react";
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
  mobile: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  awb: string | null;
  shipping_status: string | null;
};

type LiveTrack = Awaited<ReturnType<typeof trackByAwb>>;

const STAGES = [
  { key: "pending", label: "Order Placed", icon: ClipboardCheck, desc: "We've received your order" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2, desc: "Order confirmed & packed" },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "On the way with courier" },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Arrived at your doorstep" },
];

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
      .from("orders")
      .select("order_number,status,payment_method,total,created_at,customer_name,mobile,address,landmark,city,state,pincode,awb,shipping_status")
      .eq("order_number", num.trim().toUpperCase())
      .eq("email", email.trim())
      .maybeSingle();
    if (!data) { setLoading(false); toast.error("Order not found. Check details and try again."); return; }
    setOrder(data as Order);
    if (data.awb) {
      try {
        const l = await trackFn({ data: { awb: data.awb } });
        setLive(l);
      } catch { /* ignore */ }
    }
    setLoading(false);
  };

  const currentIdx = order ? Math.max(0, STAGES.findIndex((s) => s.key === order.status)) : -1;

  return (
    <SiteLayout>
      <PageHeader
        title={<>Track Your <span className="gradient-text">Order</span></>}
        description="Real-time updates powered by Delhivery."
        crumbs={[{ to: "/track-order", label: "Track Order" }]}
      />
      <div className="container-luxe pb-20">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={track} className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Order Number</label>
                <Input placeholder="GR250101XXXXX" value={num} onChange={(e) => setNum(e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
                <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-full gradient-festive border-0 shadow-glow text-base font-semibold">
              <Search className="size-4 mr-2" /> {loading ? "Searching…" : "Track Order"}
            </Button>
          </form>
        </div>

        {order && (
          <div className="max-w-4xl mx-auto mt-8 space-y-6">
            {/* Order Header */}
            <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Order ID</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="font-display text-2xl md:text-3xl font-bold">{order.order_number}</div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(order.order_number); toast.success("Copied"); }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  {order.awb && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Tracking ID: <span className="font-mono text-foreground font-semibold">{order.awb}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Placed on {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Order Total</div>
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary">{formatINR(Number(order.total))}</div>
                  <div className="text-xs mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {order.payment_method.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flipkart-style Vertical Timeline */}
            <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
              <h3 className="font-display text-xl font-bold mb-6">Order Progress</h3>
              <div className="relative">
                {STAGES.map((s, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="flex gap-4 pb-8 last:pb-0 relative">
                      {/* connector line */}
                      {i < STAGES.length - 1 && (
                        <div className={`absolute left-[19px] top-10 w-0.5 h-full ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                      )}
                      {/* icon circle */}
                      <div className={`relative z-10 size-10 shrink-0 rounded-full grid place-items-center transition-all ${
                        done ? "gradient-festive text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
                      } ${active ? "ring-4 ring-primary/20 animate-pulse" : ""}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className={`font-display font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                          {active && <span className="ml-2 text-[10px] uppercase tracking-widest text-primary">Current</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="glass rounded-3xl p-6 shadow-card">
                <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2"><MapPin className="size-4 text-primary" /> Delivery Address</h3>
                <div className="text-sm space-y-1">
                  <div className="font-semibold">{order.customer_name}</div>
                  {order.address && <div className="text-muted-foreground">{order.address}</div>}
                  {order.landmark && <div className="text-muted-foreground">Landmark: {order.landmark}</div>}
                  <div className="text-muted-foreground">
                    {[order.city, order.state, order.pincode].filter(Boolean).join(", ")}
                  </div>
                  {order.mobile && (
                    <div className="text-muted-foreground pt-1 flex items-center gap-1.5">
                      <Phone className="size-3.5" /> {order.mobile}
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Delivery */}
              <div className="glass rounded-3xl p-6 shadow-card">
                <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2"><Truck className="size-4 text-primary" /> Delivery Estimate</h3>
                {live?.expectedDelivery ? (
                  <>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Expected by</div>
                    <div className="font-display text-2xl font-bold text-primary mt-1">
                      {new Date(live.expectedDelivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                    </div>
                    {live.currentLocation && (
                      <div className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
                        <MapPin className="size-3.5" /> Currently at <strong className="text-foreground">{live.currentLocation}</strong>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {order.awb ? "Fetching live estimate…" : "Estimate will appear once your order is shipped (usually within 24 hrs)."}
                  </div>
                )}
              </div>
            </div>

            {/* Live scan events */}
            {live && live.events.length > 0 && (
              <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2"><Package className="size-4 text-primary" /> Live Tracking</h3>
                  <div className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">{live.status}</div>
                </div>
                <div className="space-y-4">
                  {live.events.map((ev, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < live.events.length - 1 && (
                        <div className="absolute left-[7px] top-4 w-0.5 h-full bg-border" />
                      )}
                      <div className={`relative z-10 size-4 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/30"}`} />
                      <div className="flex-1 pb-2">
                        <div className={`font-semibold text-sm ${i === 0 ? "text-primary" : "text-foreground"}`}>{ev.status}</div>
                        {ev.remark && <div className="text-xs text-muted-foreground mt-0.5">{ev.remark}</div>}
                        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
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
              <div className="text-center text-xs text-muted-foreground">Fetching live tracking updates…</div>
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
