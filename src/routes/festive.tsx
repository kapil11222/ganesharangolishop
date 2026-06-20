import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/festive")({
  head: () => ({ meta: [{ title: "Festive Collection — Ganesha Rangoli" }] }),
  component: () => {
    const { data = [] } = useQuery({
      queryKey: ["festive-coll"],
      queryFn: async () => {
        const { data: cat } = await supabase.from("categories").select("id").eq("slug", "festive").maybeSingle();
        if (!cat) return [];
        const { data } = await supabase.from("products").select("*").eq("category_id", cat.id).eq("is_active", true);
        return (data ?? []) as ProductCardData[];
      },
    });
    return (
      <SiteLayout>
        <PageHeader eyebrow="Diwali · Holi · Navratri" title={<>Festive <span className="gradient-text">Collection</span></>} description="Light up every Indian festival with hand-crafted rangolis." crumbs={[{ to: "/festive", label: "Festive" }]} />
        <div className="container-luxe pb-20"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{data.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div></div>
      </SiteLayout>
    );
  },
});
