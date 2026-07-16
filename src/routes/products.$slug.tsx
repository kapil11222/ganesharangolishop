import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Share2, Truck, RefreshCw, ShieldCheck, Star, Minus, Plus, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PincodeCheck } from "@/components/site/PincodeCheck";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCart, formatINR } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const add = useCart((s) => s.addItem);
  const toggleWish = useCart((s) => s.toggleWishlist);
  const inWish = useCart((s) => s.wishlist.includes(slug));
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("products").select("*")
        .eq("category_id", product!.category_id!)
        .neq("id", product!.id)
        .limit(4);
      return (data ?? []) as ProductCardData[];
    },
  });

  if (isLoading) {
    return <SiteLayout><div className="container-luxe py-20"><div className="shimmer h-96 rounded-3xl" /></div></SiteLayout>;
  }
  if (!product) throw notFound();

  const off = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inStock = product.stock > 0;

  const onAdd = () => {
    add({
      id: product.id, slug: product.slug, name: product.name, price: product.price, mrp: product.mrp,
      image: product.images[0], allow_cod: product.allow_cod, allow_prepaid: product.allow_prepaid,
    }, qty);
    toast.success("Added to cart 🛍️");
  };
  const onBuy = () => { onAdd(); navigate({ to: "/checkout" }); };

  return (
    <SiteLayout>
      <div className="container-luxe pt-10 pb-20">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> / <span>{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div
              key={imgIdx}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-square rounded-3xl overflow-hidden glass shadow-luxe"
            >
              <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              {off > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  Save {off}%
                </div>
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {product.images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 size-20 rounded-2xl overflow-hidden border-2 transition ${
                      i === imgIdx ? "border-primary" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.festival && (
              <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{product.festival}</div>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              {(product.review_count ?? 0) > 0 ? (
                <>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`size-4 ${i < Math.round(product.rating ?? 0) ? "fill-secondary text-secondary" : "text-muted-foreground/40"}`} />)}
                  </div>
                  <span className="text-sm font-semibold">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.review_count} {product.review_count === 1 ? "review" : "reviews"})</span>
                </>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">✨ New Product</span>
              )}
            </div>
            <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mt-7 flex items-end gap-3">
              <div className="font-display text-4xl font-bold text-primary">{formatINR(product.price)}</div>
              {product.mrp && product.mrp > product.price && (
                <>
                  <div className="text-lg text-muted-foreground line-through">{formatINR(product.mrp)}</div>
                  <div className="text-sm font-semibold text-accent">{off}% off</div>
                </>
              )}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 text-sm">
              <Check className={`size-4 ${inStock ? "text-emerald-500" : "text-destructive"}`} />
              {inStock ? <span className="text-emerald-500 font-medium">In stock — ships in 24 hrs</span> : <span className="text-destructive font-medium">Out of stock</span>}
            </div>

            {/* Variants */}
            <div className="mt-7 grid grid-cols-3 gap-3 text-sm">
              {product.size && <div className="glass rounded-xl p-3"><div className="text-xs text-muted-foreground">Size</div><div className="font-semibold">{product.size}</div></div>}
              {product.color && <div className="glass rounded-xl p-3"><div className="text-xs text-muted-foreground">Color</div><div className="font-semibold">{product.color}</div></div>}
              {product.material && <div className="glass rounded-xl p-3"><div className="text-xs text-muted-foreground">Material</div><div className="font-semibold">{product.material}</div></div>}
            </div>

            {/* Quantity + CTAs */}
            <div className="mt-7 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 glass rounded-full p-1">
                <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="size-4" /></Button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty(qty + 1)}><Plus className="size-4" /></Button>
              </div>
              <Button onClick={onAdd} disabled={!inStock} size="lg" variant="outline" className="rounded-full h-12 px-6">
                <ShoppingBag className="size-4 mr-2" /> Add to Cart
              </Button>
              <Button onClick={onBuy} disabled={!inStock} size="lg" className="rounded-full h-12 px-8 gradient-festive border-0 shadow-glow">
                Buy Now
              </Button>
              <Button
                size="icon" variant="outline" className="rounded-full h-12 w-12"
                onClick={() => { toggleWish(product.id); toast.success("Wishlist updated"); }}
              >
                <Heart className={`size-4 ${inWish ? "fill-accent text-accent" : ""}`} />
              </Button>
              <Button
                size="icon" variant="outline" className="rounded-full h-12 w-12"
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}
              >
                <Share2 className="size-4" />
              </Button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Payment options: {product.allow_cod && "Cash on Delivery"} {product.allow_cod && product.allow_prepaid && " · "} {product.allow_prepaid && "Prepaid (UPI)"}
            </div>

            {/* Pincode Check */}
            <div className="mt-6">
              <PincodeCheck weightGrams={500} codAmount={product.price * qty} />
            </div>


            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              {[{ i: Truck, t: "Free Shipping ₹999+" }, { i: RefreshCw, t: "7-Day Returns" }, { i: ShieldCheck, t: "Secure Checkout" }].map((b) => (
                <div key={b.t} className="glass rounded-2xl p-4 text-center">
                  <b.i className="size-5 mx-auto text-primary mb-1" />
                  <div>{b.t}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="desc" className="mt-10">
              <TabsList className="glass">
                <TabsTrigger value="desc">Description</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="desc" className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {product.description} Crafted with premium velvet base and hand-finished detailing.
                Reusable across festivals — simply dust off and store flat.
              </TabsContent>
              <TabsContent value="shipping" className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Free shipping on orders above ₹999. Dispatch within 24 hours. Delivery in 3-7 business days across India.
                COD available. 7-day easy returns on undamaged items.
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 text-sm text-muted-foreground">
                Average rating <strong>{product.rating}/5</strong> from {product.review_count} customers. Review submission coming soon.
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl font-bold mb-8">You may also <span className="gradient-text">love</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
