import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, formatINR } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Ganesha Rangoli" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const shipping = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax - discount;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const { data } = await supabase
      .from("coupons").select("*").eq("code", coupon.trim().toUpperCase())
      .eq("is_active", true).maybeSingle();
    if (!data) { toast.error("Invalid coupon"); return; }
    if (data.min_order_value && subtotal < Number(data.min_order_value)) {
      toast.error(`Min order ₹${data.min_order_value} required`); return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Coupon expired"); return; }
    const d = data.discount_type === "percentage"
      ? Math.round((subtotal * Number(data.discount_value)) / 100)
      : Number(data.discount_value);
    setDiscount(d);
    setAppliedCode(data.code);
    toast.success(`Coupon applied: -${formatINR(d)}`);
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <PageHeader title={<>Your <span className="gradient-text">Cart</span></>} crumbs={[{ to: "/cart", label: "Cart" }]} />
        <div className="container-luxe pb-20">
          <div className="text-center py-20 glass rounded-3xl">
            <ShoppingBag className="size-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2">Discover beautiful rangolis to make your festivals unforgettable.</p>
            <Link to="/shop"><Button className="mt-6 rounded-full gradient-festive border-0 shadow-glow">Shop now</Button></Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader title={<>Your <span className="gradient-text">Cart</span></>} description={`${items.length} ${items.length === 1 ? "item" : "items"} in your cart`} crumbs={[{ to: "/cart", label: "Cart" }]} />
      <div className="container-luxe pb-20 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.id} className="glass rounded-3xl p-4 flex gap-4 items-center shadow-card">
              <img src={it.image} alt={it.name} className="size-24 rounded-2xl object-cover" />
              <div className="flex-1 min-w-0">
                <Link to="/products/$slug" params={{ slug: it.slug }}>
                  <h3 className="font-display text-lg font-bold hover:text-primary line-clamp-1">{it.name}</h3>
                </Link>
                <div className="text-primary font-bold mt-1">{formatINR(it.price)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1 glass rounded-full p-0.5">
                    <Button size="icon" variant="ghost" className="size-7 rounded-full" onClick={() => updateQty(it.id, it.quantity - 1)}><Minus className="size-3" /></Button>
                    <span className="w-6 text-center text-sm font-bold">{it.quantity}</span>
                    <Button size="icon" variant="ghost" className="size-7 rounded-full" onClick={() => updateQty(it.id, it.quantity + 1)}><Plus className="size-3" /></Button>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => remove(it.id)}><Trash2 className="size-4" /></Button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatINR(it.price * it.quantity)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-3xl p-6 shadow-luxe sticky top-28">
            <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="pl-9 rounded-full" />
              </div>
              <Button onClick={applyCoupon} variant="outline" className="rounded-full">Apply</Button>
            </div>
            {appliedCode && <div className="text-xs text-emerald-500 font-semibold mb-3">✓ {appliedCode} applied</div>}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>{formatINR(tax)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-500"><span>Discount</span><span>-{formatINR(discount)}</span></div>}
            </div>
            <div className="h-px bg-border my-4" />
            <div className="flex justify-between text-lg font-bold mb-5"><span>Total</span><span className="text-primary">{formatINR(total)}</span></div>
            <Link to="/checkout">
              <Button className="w-full h-12 rounded-full gradient-festive border-0 shadow-glow text-base font-semibold">
                Checkout <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-3">🔒 Secure 256-bit encrypted checkout</p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
