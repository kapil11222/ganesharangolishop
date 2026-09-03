import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart, formatINR } from "@/lib/cart-store";
import { useLiveCampaigns } from "@/components/site/OfferStrip";
import { productSaleFor } from "@/lib/offers";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Ganesha Rangoli" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());
  const { data: campaigns = [] } = useLiveCampaigns();
  const saleSavings = items.reduce((sum, it) => {
    const sale = productSaleFor(it.id, it.price, campaigns);
    return sum + (sale ? (it.price - sale.salePrice) * it.quantity : 0);
  }, 0);
  const bestCoupon = campaigns.find((c) => c.coupon_code)?.coupon_code ?? null;

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
            <h3 className="font-display text-xl font-bold mb-4">Cart Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>Inclusive in price</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Coupon</span><span>Apply at checkout</span></div>
            </div>
            {saleSavings > 0 && (
              <div className="mt-3 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-600">
                🎉 You saved {formatINR(saleSavings)} in this sale
              </div>
            )}
            {bestCoupon && (
              <p className="mt-2 text-xs text-muted-foreground">
                Best offer for you: use code <span className="font-mono font-bold">{bestCoupon}</span> at checkout.
              </p>
            )}
            <div className="h-px bg-border my-4" />
            <div className="flex justify-between text-lg font-bold mb-5"><span>Estimated Total</span><span className="text-primary">{formatINR(subtotal)}</span></div>
            <Link to="/checkout">
              <Button className="w-full h-12 rounded-full gradient-festive border-0 shadow-glow text-base font-semibold">
                Proceed to Checkout <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-3">🔒 Secure 256-bit encrypted checkout</p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
