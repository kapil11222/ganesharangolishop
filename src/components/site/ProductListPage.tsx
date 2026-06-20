import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

type Filter = Record<string, unknown>;

export function ProductListPage({
  eyebrow, title, description, crumb, filter, queryKey,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  crumb: { to: string; label: string };
  filter: Filter;
  queryKey: string;
}) {
  const { data = [] } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      let q = supabase.from("products").select("*").eq("is_active", true);
      Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v as never); });
      const { data } = await q.order("created_at", { ascending: false });
      return (data ?? []) as ProductCardData[];
    },
  });
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} description={description} crumbs={[crumb]} />
      <div className="container-luxe pb-20">
        {data.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl text-muted-foreground">Nothing here yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
