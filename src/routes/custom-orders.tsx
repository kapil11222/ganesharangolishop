import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Palette, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/custom-orders")({
  head: () => ({ meta: [{ title: "Custom Orders — Ganesha Rangoli" }] }),
  component: () => {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const { error } = await supabase.from("support_tickets").insert({
        name: form.name, email: form.email, phone: form.phone,
        category: "Custom", subject: form.subject || "Custom rangoli", message: form.message,
      });
      setLoading(false);
      if (error) toast.error("Couldn't submit"); else { toast.success("Thanks! Our design team will be in touch within 24 hrs."); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }
    };
    return (
      <SiteLayout>
        <PageHeader eyebrow="Bespoke design" title={<>Custom <span className="gradient-text">Orders</span></>} description="Bring us your vision — names, deities, motifs, sizes. We craft one-of-a-kind rangolis." crumbs={[{ to: "/custom-orders", label: "Custom" }]} />
        <div className="container-luxe pb-20 grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="size-16 rounded-2xl gradient-festive grid place-items-center text-primary-foreground"><Palette className="size-8" /></div>
            <h2 className="font-display text-2xl font-bold">How it works</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {["Share your idea + reference images","We send a digital mockup within 48 hrs","Approve & we craft your rangoli","Ships within 7-10 working days"].map((step, i) => (
                <li key={step} className="flex gap-3"><span className="size-6 rounded-full gradient-festive text-primary-foreground text-xs font-bold grid place-items-center shrink-0">{i+1}</span>{step}</li>
              ))}
            </ol>
          </div>
          <form onSubmit={submit} className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4">
            <h3 className="font-display text-xl font-bold">Tell us your vision</h3>
            <Input placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="tel" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Design title" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea required rows={5} placeholder="Size, colors, motif, occasion, deadline…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow"><Send className="size-4 mr-2" /> {loading ? "Sending…" : "Request quote"}</Button>
          </form>
        </div>
      </SiteLayout>
    );
  },
});
