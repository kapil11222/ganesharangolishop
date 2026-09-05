import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart, formatINR } from "@/lib/cart-store";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProductSale, SaleTag, DealEndsPill, SalePrice } from "@/components/site/SaleProductBadge";
import { accentOf } from "@/lib/offers";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  short_description?: string | null;
  price: number;
  mrp?: number | null;
  images: string[];
  rating?: number | null;
  review_count?: number | null;
  is_best_seller?: boolean | null;
  is_new_arrival?: boolean | null;
  festival?: string | null;
  allow_cod: boolean;
  allow_prepaid: boolean;
};

export function ProductCard({ p, index = 0 }: { p: ProductCardData; index?: number }) {
  const add = useCart((s) => s.addItem);
  const toggleWish = useCart((s) => s.toggleWishlist);
  const inWish = useCart((s) => s.wishlist.includes(p.id));
  const off = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const sale = useProductSale(p.id, p.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <div
        className={`relative rounded-3xl glass overflow-hidden transition-all duration-500 ${
          sale
            ? "ring-2 ring-offset-2 ring-offset-background shadow-luxe"
            : "shadow-card hover:shadow-luxe"
        }`}
        style={sale ? { boxShadow: `0 0 0 1px ${accentOf(sale.campaign)}22, 0 18px 40px -18px ${accentOf(sale.campaign)}66`, borderColor: accentOf(sale.campaign) } : undefined}
      >
        <Link to="/products/$slug" params={{ slug: p.slug }} className="block">
          <div className="aspect-[4/5] overflow-hidden bg-muted relative">
            <img
              src={p.images[0]}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              {sale && <SaleTag sale={sale} />}
              {off > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold tracking-wide">
                  -{off}%
                </span>
              )}
              {p.is_best_seller && (
                <span className="px-2.5 py-1 rounded-full gradient-festive text-primary-foreground text-[10px] font-bold tracking-wide">
                  BESTSELLER
                </span>
              )}
              {p.is_new_arrival && (
                <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wide">
                  NEW
                </span>
              )}
            </div>
          </div>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(p.id);
            toast.success(inWish ? "Removed from wishlist" : "Added to wishlist ❤️");
          }}
          aria-label="Wishlist"
          className="absolute top-3 right-3 size-9 rounded-full glass-strong grid place-items-center hover:scale-110 transition"
        >
          <Heart className={`size-4 ${inWish ? "fill-accent text-accent" : ""}`} />
        </button>

        <div className="p-4 space-y-2">
          {p.festival && (
            <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">{p.festival}</div>
          )}
          <Link to="/products/$slug" params={{ slug: p.slug }}>
            <h3 className="font-display text-lg font-bold leading-tight line-clamp-1 group-hover:text-primary transition">
              {p.name}
            </h3>
          </Link>
          {p.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{p.short_description}</p>
          )}
          <div className="flex items-center gap-1 text-xs">
            {(p.review_count ?? 0) > 0 ? (
              <>
                <Star className="size-3.5 fill-secondary text-secondary" />
                <span className="font-semibold">{p.rating ?? 4.8}</span>
                <span className="text-muted-foreground">({p.review_count}) · In stock</span>
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">New Product</span>
                <span className="text-muted-foreground">· In stock</span>
              </>
            )}
          </div>
          {sale && <DealEndsPill sale={sale} />}
          <div className="flex items-end justify-between pt-1">
            {sale ? (
              <SalePrice sale={sale} price={p.price} />
            ) : (
              <div>
                <div className="font-display text-xl font-bold text-primary">{formatINR(p.price)}</div>
                {p.mrp && p.mrp > p.price && (
                  <div className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</div>
                )}
              </div>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                add({
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  mrp: p.mrp,
                  image: p.images[0],
                  allow_cod: p.allow_cod,
                  allow_prepaid: p.allow_prepaid,
                });
                toast.success("Added to cart 🛍️");
              }}
              className="size-10 rounded-full gradient-festive grid place-items-center shadow-glow hover:scale-110 transition text-primary-foreground"
              aria-label="Add to cart"
            >
              <ShoppingBag className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
