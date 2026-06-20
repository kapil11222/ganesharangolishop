import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories/$slug")({
  component: CatPage,
});

function CatPage() {
  const { slug } = Route.useParams();
  const { data: cat } = useQuery({
    queryKey: ["cat", slug],
    queryFn: async () => (await supabase.from("categories").select("*").eq("slug", slug).maybeSingle()).data,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["cat-products", cat?.id],
    enabled: !!cat?.id,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("category_id", cat!.id).eq("is_active", true);
      return (data ?? []) as ProductCardData[];
    },
  });
  if (cat === null) throw notFound();
  return (
    <SiteLayout>
      <PageHeader eyebrow="Collection" title={cat?.name ?? "..."} description={cat?.description ?? ""} crumbs={[{ to: "/categories", label: "Categories" }, { to: "#", label: cat?.name ?? "" }]} />
      <div className="container-luxe pb-20">
        {products.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl text-muted-foreground">No products yet in this collection.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
