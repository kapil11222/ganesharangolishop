import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";

const posts = [
  { slug: "diwali-rangoli-guide", title: "The Complete Diwali Rangoli Guide", excerpt: "From traditional motifs to modern designs — make this Diwali your most beautiful yet.", date: "Oct 2025", read: "6 min", img: "https://images.unsplash.com/photo-1604595287233-3da3fb05fc15?w=900" },
  { slug: "wedding-mandala-trends", title: "2026 Wedding Mandala Trends", excerpt: "What's trending in wedding rangolis this season — pastels, gold, and grand mandalas.", date: "Sep 2025", read: "5 min", img: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=900" },
  { slug: "reuse-rangoli", title: "How to Reuse & Care for Your Rangoli", excerpt: "Make your rangoli last for years with these simple care tips.", date: "Aug 2025", read: "4 min", img: "https://images.unsplash.com/photo-1604933762023-d3b4f8c6d4d2?w=900" },
];

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — Ganesha Rangoli" }] }),
  component: () => (
    <SiteLayout>
      <PageHeader eyebrow="Stories & Guides" title={<>The <span className="gradient-text">Rangoli</span> Journal</>} description="Inspiration, design tips and festival guides from our studio." crumbs={[{ to: "/blog", label: "Blog" }]} />
      <div className="container-luxe pb-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link key={p.slug} to="/blog" className="group glass rounded-3xl overflow-hidden shadow-card hover:shadow-luxe transition">
            <div className="aspect-[16/10] overflow-hidden"><img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
            <div className="p-6">
              <div className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="size-3" />{p.date}</span><span className="flex items-center gap-1"><Clock className="size-3" />{p.read}</span></div>
              <h3 className="font-display text-xl font-bold mt-2 group-hover:text-primary transition">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </SiteLayout>
  ),
});
