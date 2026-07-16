import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Wallet, Smartphone, ArrowRight, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, formatINR } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { checkPincode } from "@/lib/delhivery/shipping.functions";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ganesha Rangoli" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "10-digit mobile"),
  alt_mobile: z.string().trim().regex(/^[0-9]{10}$/).optional().or(z.literal("")),
  email: z.string().trim().email().max(120),
  address: z.string().trim().min(8).max(300),
  landmark: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "6-digit pincode"),
  country: z.string().trim().default("India"),
  gst_number: z.string().trim().max(20).optional().or(z.literal("")),
  order_notes: z.string().trim().max(500).optional().or(z.literal("")),
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"cod" | "prepaid">("cod");

  const allowCOD = items.every((i) => i.allow_cod);
  const allowPrepaid = items.every((i) => i.allow_prepaid);

  const [liveRate, setLiveRate] = useState<null | { serviceable: boolean; city?: string; state?: string; cod?: boolean; prepaidRate?: number | null; codRate?: number | null }>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const checkPin = useServerFn(checkPincode);

  const baseShipping = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 79;
  const liveShipping = liveRate?.serviceable
    ? (payment === "cod" ? (liveRate.codRate ?? liveRate.prepaidRate ?? baseShipping) : (liveRate.prepaidRate ?? baseShipping))
    : baseShipping;
  const shipping = subtotal > 999 ? 0 : liveShipping;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;


  const [form, setForm] = useState({
    customer_name: "", mobile: "", alt_mobile: "", email: "",
    address: "", landmark: "", city: "", state: "", pincode: "", country: "India",
    gst_number: "", order_notes: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Auto-check pincode when 6 digits entered
  useEffect(() => {
    if (!/^[0-9]{6}$/.test(form.pincode)) { setLiveRate(null); return; }
    let cancelled = false;
    setCheckingPin(true);
    checkPin({ data: { pincode: form.pincode, weightGrams: Math.max(500, items.length * 500), codAmount: total } })
      .then((r) => {
        if (cancelled) return;
        setLiveRate(r);
        if (r.serviceable) {
          if (r.city && !form.city) setForm((p) => ({ ...p, city: r.city! }));
          if (r.state && !form.state) setForm((p) => ({ ...p, state: r.state! }));
          if (!r.cod && payment === "cod") setPayment("prepaid");
        }
      })
      .catch(() => setLiveRate(null))
      .finally(() => { if (!cancelled) setCheckingPin(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.pincode]);

  const placeOrder = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(`${first.path.join(".")}: ${first.message}`);
      return;
    }
    if (items.length === 0) { toast.error("Cart is empty"); return; }
    setSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          ...parsed.data,
          user_id: session.session?.user?.id ?? null,
          payment_method: payment,
          subtotal, shipping, tax, discount: 0, total,
        })
        .select()
        .single();
      if (error) throw error;
      const itemRows = items.map((i) => ({
        order_id: order.id, product_id: i.id, product_name: i.name,
        product_image: i.image, unit_price: i.price, quantity: i.quantity, total: i.price * i.quantity,
      }));
      const { error: ie } = await supabase.from("order_items").insert(itemRows);
      if (ie) throw ie;
      clear();
      toast.success("Order placed successfully! 🎉");
      navigate({ to: "/order-success/$orderNumber", params: { orderNumber: order.order_number } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Order failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => ({ subtotal, shipping, tax, total }), [subtotal, shipping, tax, total]);

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container-luxe py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
          <Link to="/shop"><Button className="mt-6 rounded-full gradient-festive border-0">Shop now</Button></Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        title={<>Secure <span className="gradient-text">Checkout</span></>}
        description="100% safe. Pay on delivery or via UPI — we'll call to confirm prepaid orders."
        crumbs={[{ to: "/cart", label: "Cart" }, { to: "/checkout", label: "Checkout" }]}
      />
      <div className="container-luxe pb-20 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
            <h2 className="font-display text-xl font-bold mb-5">1 · Shipping Address</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name *"><Input value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} /></Field>
              <Field label="Mobile Number *"><Input type="tel" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} maxLength={10} /></Field>
              <Field label="Alternative Number"><Input type="tel" value={form.alt_mobile} onChange={(e) => update("alt_mobile", e.target.value)} maxLength={10} /></Field>
              <Field label="Email *"><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
              <Field label="Complete Address *" full><Textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} /></Field>
              <Field label="Landmark"><Input value={form.landmark} onChange={(e) => update("landmark", e.target.value)} /></Field>
              <Field label="City *"><Input value={form.city} onChange={(e) => update("city", e.target.value)} /></Field>
              <Field label="State *"><Input value={form.state} onChange={(e) => update("state", e.target.value)} /></Field>
              <Field label="Pincode *">
                <Input value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} maxLength={6} />
                {checkingPin && <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Checking serviceability…</div>}
                {liveRate && !checkingPin && (
                  liveRate.serviceable
                    ? <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="size-3" /> Delivers to {liveRate.city}, {liveRate.state}{!liveRate.cod && " · COD unavailable"}</div>
                    : <div className="mt-1 text-xs text-destructive flex items-center gap-1"><XCircle className="size-3" /> Not serviceable</div>
                )}
              </Field>
              <Field label="Country *"><Input value={form.country} onChange={(e) => update("country", e.target.value)} /></Field>
              <Field label="GST Number (Optional)" full><Input value={form.gst_number} onChange={(e) => update("gst_number", e.target.value)} /></Field>
              <Field label="Order Notes" full><Textarea value={form.order_notes} onChange={(e) => update("order_notes", e.target.value)} rows={2} placeholder="Anything we should know?" /></Field>
            </div>
          </div>

          {/* Payment */}
          <div className="glass rounded-3xl p-6 md:p-8 shadow-card">
            <h2 className="font-display text-xl font-bold mb-5">2 · Payment Method</h2>
            <div className="space-y-3">
              {allowCOD && (
                <button
                  onClick={() => setPayment("cod")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition flex items-start gap-4 ${
                    payment === "cod" ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Wallet className="size-6 text-primary shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-display text-lg font-bold">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay with cash when your order is delivered.</div>
                  </div>
                </button>
              )}
              {allowPrepaid && (
                <button
                  onClick={() => setPayment("prepaid")}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition flex items-start gap-4 ${
                    payment === "prepaid" ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Smartphone className="size-6 text-primary shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-display text-lg font-bold">Prepaid (UPI)</div>
                    <div className="text-sm text-muted-foreground">Our team will call you from +91 9209063985 to collect UPI payment securely.</div>
                  </div>
                </button>
              )}
            </div>
            {payment === "prepaid" && (
              <div className="mt-5 p-5 rounded-2xl bg-secondary/10 border border-secondary/30 text-sm">
                <div className="flex items-center gap-2 font-bold mb-2"><ShieldCheck className="size-4 text-secondary" /> Your payment is 100% secure</div>
                Thank you for placing your order. Our team will call you from <strong>+91 9209063985</strong> on your registered mobile to confirm your order and collect UPI payment securely.
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="glass-strong rounded-3xl p-6 shadow-luxe sticky top-28">
            <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 text-sm">
                  <img src={it.image} alt="" className="size-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{it.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <div className="font-bold">{formatINR(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(summary.subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{summary.shipping === 0 ? "Free" : formatINR(summary.shipping)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatINR(summary.tax)}</span></div>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 mb-5"><span>Total</span><span className="text-primary">{formatINR(summary.total)}</span></div>
            <Button onClick={placeOrder} disabled={submitting} className="w-full h-12 rounded-full gradient-festive border-0 shadow-glow text-base font-semibold">
              {submitting ? "Placing…" : <>Place Order <ArrowRight className="size-4 ml-2" /></>}
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3" /> Encrypted · 256-bit SSL
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
