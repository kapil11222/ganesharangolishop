import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us — Ganesha Rangoli" }] }),
  component: () => (
    <SiteLayout>
      <PageHeader eyebrow="Our story" title={<>Hand-crafted with <span className="gradient-text">heart</span></>} description="Ganesha Rangoli began with a simple wish — to make every Indian celebration just a little more magical." crumbs={[{ to: "/about", label: "About" }]} />
      <div className="container-luxe pb-20 space-y-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="aspect-square rounded-3xl overflow-hidden shadow-luxe">
            <img src="https://images.unsplash.com/photo-1604595287233-3da3fb05fc15?w=900" alt="" className="w-full h-full object-cover" />
          </motion.div>
          <div className="space-y-5">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Born from <span className="gradient-text">tradition</span>, designed for today</h2>
            <p className="text-muted-foreground leading-relaxed">Growing up in Maharashtra, festivals meant flour rangolis at every doorstep. We wanted to preserve that beauty — but make it lasting, reusable, and accessible to every busy family. So we built Ganesha Rangoli.</p>
            <p className="text-muted-foreground leading-relaxed">Today, every rangoli is hand-finished by skilled artisans, using premium velvet and intricate detailing — designed to be reused festival after festival.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 glass-strong rounded-3xl p-10 shadow-luxe">
          {[{ n: 10, s: "+", l: "Years" },{ n: 10000, s: "+", l: "Customers" },{ n: 50000, s: "+", l: "Orders" },{ n: 200, s: "+", l: "Designs" }].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold gradient-text"><AnimatedCounter to={s.n} suffix={s.s} /></div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[{ t: "Our Mission", d: "Bring beauty to every Indian home — sustainably, affordably, and with the highest craft." },{ t: "Our Vision", d: "Become India's most-loved rangoli & festival décor brand — celebrated worldwide." },{ t: "Our Values", d: "Quality first. Honest pricing. Real customer support. Always." }].map((b) => (
            <div key={b.t} className="glass rounded-3xl p-7 shadow-card">
              <h3 className="font-display text-xl font-bold">{b.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  ),
});
