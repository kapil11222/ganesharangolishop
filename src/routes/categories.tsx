import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Ganesha Rangoli" }] }),
  component: CatsPage,
});

function CatsPage() {
  const { data = [] } = useQuery({
    queryKey: ["cats-all"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });
  return (
    <SiteLayout>
      <PageHeader eyebrow="Browse" title={<>Shop by <span className="gradient-text">Category</span></>} description="From festive to wedding — discover rangolis curated by occasion." crumbs={[{ to: "/categories", label: "Categories" }]} />
      <div className="container-luxe pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Link to="/categories/$slug" params={{ slug: c.slug }} className="group block">
              <div className="relative aspect-[5/6] rounded-3xl overflow-hidden shadow-card hover:shadow-luxe transition">
                <img src={c.image_url ?? ""} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </SiteLayout>
  );
}
