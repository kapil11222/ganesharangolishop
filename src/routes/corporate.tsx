import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/corporate")({
  head: () => ({ meta: [{ title: "Corporate Orders — Ganesha Rangoli" }] }),
  component: () => {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const { error } = await supabase.from("support_tickets").insert({
        name: form.name, email: form.email, phone: form.phone,
        category: "Corporate", subject: form.subject || "Corporate inquiry", message: form.message,
      });
      setLoading(false);
      if (error) toast.error("Couldn't submit"); else { toast.success("Thanks! Our corporate team will reach out shortly."); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }
    };
    return (
      <SiteLayout>
        <PageHeader eyebrow="For businesses" title={<>Corporate <span className="gradient-text">Orders</span></>} description="Branded rangolis for offices, hotels, retail chains, and corporate events." crumbs={[{ to: "/corporate", label: "Corporate" }]} />
        <div className="container-luxe pb-20 grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="size-16 rounded-2xl gradient-festive grid place-items-center text-primary-foreground"><Building2 className="size-8" /></div>
            <h2 className="font-display text-2xl font-bold">Trusted by brands</h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Custom logo & brand color integration","White-label gift sets","Diwali & festival gifting at scale","GST invoices · purchase orders accepted","Pan-India delivery","Account manager for ongoing partnerships"].map((b) => (
                <li key={b} className="flex gap-2"><span className="text-primary mt-0.5">✓</span>{b}</li>
              ))}
            </ul>
          </div>
          <form onSubmit={submit} className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4">
            <h3 className="font-display text-xl font-bold">Corporate Inquiry</h3>
            <Input placeholder="Company name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Business email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="tel" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Subject / Occasion" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea required rows={5} placeholder="Quantity, branding requirements, timeline…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow"><Send className="size-4 mr-2" /> {loading ? "Sending…" : "Submit"}</Button>
          </form>
        </div>
      </SiteLayout>
    );
  },
});
