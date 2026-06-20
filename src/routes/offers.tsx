import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tag, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Offers & Deals — Ganesha Rangoli" }] }),
  component: () => {
    const { data: products = [] } = useQuery({
      queryKey: ["offers-products"],
      queryFn: async () => {
        const { data } = await supabase.from("products").select("*").eq("is_active", true);
        return ((data ?? []) as ProductCardData[]).filter((p) => p.mrp && p.mrp > p.price);
      },
    });
    const { data: coupons = [] } = useQuery({
      queryKey: ["active-coupons"],
      queryFn: async () => (await supabase.from("coupons").select("*").eq("is_active", true)).data ?? [],
    });
    return (
      <SiteLayout>
        <PageHeader eyebrow="Save big" title={<>Festive <span className="gradient-text">Offers</span></>} description="Limited-time deals you won't want to miss." crumbs={[{ to: "/offers", label: "Offers" }]} />
        <div className="container-luxe pb-20 space-y-12">
          <div className="grid md:grid-cols-2 gap-5">
            {coupons.map((c) => (
              <div key={c.id} className="glass-strong rounded-3xl p-6 shadow-luxe flex items-center gap-5">
                <div className="size-14 rounded-full gradient-festive grid place-items-center text-primary-foreground"><Sparkles className="size-6" /></div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Coupon Code</div>
                  <div className="font-display text-2xl font-bold">{c.code}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} flat off`}
                    {c.min_order_value ? ` on orders above ₹${c.min_order_value}` : ""}
                  </div>
                </div>
                <Tag className="size-5 text-primary" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold mb-6">Discounted <span className="gradient-text">Rangolis</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  },
});
