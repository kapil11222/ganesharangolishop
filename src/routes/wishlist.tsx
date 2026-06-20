import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Ganesha Rangoli" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const wishlist = useCart((s) => s.wishlist);
  const { data = [] } = useQuery({
    queryKey: ["wishlist-products", wishlist],
    enabled: wishlist.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").in("id", wishlist);
      return (data ?? []) as ProductCardData[];
    },
  });
  return (
    <SiteLayout>
      <PageHeader title={<>Your <span className="gradient-text">Wishlist</span></>} crumbs={[{ to: "/wishlist", label: "Wishlist" }]} />
      <div className="container-luxe pb-20">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <Heart className="size-16 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-display text-2xl font-bold">No favourites yet</h2>
            <p className="text-muted-foreground mt-2">Tap the heart on any rangoli to save it here.</p>
            <Link to="/shop"><Button className="mt-5 rounded-full gradient-festive border-0">Discover rangolis</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
