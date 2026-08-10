import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { OfferBlocks } from "@/components/site/OfferBlocks";

import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Premium Rangolis — Ganesha Rangoli" },
      { name: "description", content: "Browse our full collection of premium reusable rangolis. Filter by festival, color, price & more." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { data: products = [] } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return (data ?? []) as ProductCardData[];
    },
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["shop-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let res = products.filter((p) => p.price <= maxPrice);
    if (q) res = res.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (selectedCats.length) res = res.filter((p) => selectedCats.includes((p as ProductCardData & { category_id?: string }).category_id ?? ""));
    if (sort === "price-asc") res = [...res].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") res = [...res].sort((a, b) => b.price - a.price);
    if (sort === "rating") res = [...res].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return res;
  }, [products, q, maxPrice, selectedCats, sort]);

  const Filters = () => (
    <div className="space-y-7">
      <div>
        <h4 className="font-display font-bold mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <Checkbox
                checked={selectedCats.includes(c.id)}
                onCheckedChange={(v) => setSelectedCats((p) => v ? [...p, c.id] : p.filter((x) => x !== c.id))}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3">Max Price: ₹{maxPrice}</h4>
        <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} max={3000} step={100} />
      </div>
      <div>
        <h4 className="font-display font-bold mb-3">Sort by</h4>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      {(q || selectedCats.length || maxPrice < 3000 || sort !== "newest") && (
        <Button variant="ghost" className="w-full" onClick={() => { setQ(""); setSelectedCats([]); setMaxPrice(3000); setSort("newest"); }}>
          <X className="size-4 mr-1" /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="The Collection"
        title={<>Shop our <span className="gradient-text">Rangolis</span></>}
        description="Hand-crafted, reusable, festival-ready. Filter by your favourite festival or design."
        crumbs={[{ to: "/shop", label: "Shop" }]}
      />
      <div className="pb-10">
        <OfferBlocks title="Live offers" subtitle="Grab a coupon before you check out." limit={3} />
      </div>
      <div className="container-luxe pb-20">

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28 self-start glass rounded-2xl p-6">
            <Filters />
          </aside>
          <div className="flex-1">
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search rangolis…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 h-12 rounded-full glass"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-full lg:hidden glass">
                    <SlidersHorizontal className="size-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] glass-strong overflow-y-auto">
                  <div className="mt-8"><Filters /></div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="text-sm text-muted-foreground mb-4">{filtered.length} products</div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl">
                <div className="text-5xl mb-3">🪔</div>
                <p className="font-display text-xl">No rangolis match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
