import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Package, Send } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function makeInquiryPage({
  slug, eyebrow, title, description, category, icon: Icon,
}: { slug: string; eyebrow: string; title: string; description: string; category: string; icon: typeof Building2; }) {
  return function Page() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const { error } = await supabase.from("support_tickets").insert({
        name: form.name, email: form.email, phone: form.phone,
        category, subject: form.subject || title, message: form.message,
      });
      setLoading(false);
      if (error) toast.error("Couldn't submit"); else { toast.success("Thanks! We'll get back to you within 24 hrs."); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }
    };
    return (
      <SiteLayout>
        <PageHeader eyebrow={eyebrow} title={<>{title.split(" ").slice(0, -1).join(" ")} <span className="gradient-text">{title.split(" ").slice(-1)}</span></>} description={description} crumbs={[{ to: `/${slug}`, label: title }]} />
        <div className="container-luxe pb-20 grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="size-16 rounded-2xl gradient-festive grid place-items-center text-primary-foreground"><Icon className="size-8" /></div>
            <h2 className="font-display text-2xl font-bold">Why partner with us</h2>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Volume pricing — save up to 40%","Custom designs to match your brand","Pan-India delivery with tracking","Dedicated relationship manager","GST invoices · Net-30 terms available","Free design consultation"].map((b) => (
                <li key={b} className="flex gap-2"><span className="text-primary mt-0.5">✓</span>{b}</li>
              ))}
            </ul>
          </div>
          <form onSubmit={submit} className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4">
            <h3 className="font-display text-xl font-bold">Tell us about your needs</h3>
            <Input placeholder="Name / Company *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="tel" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea required rows={5} placeholder="Quantity, occasion, timeline, design ideas…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow"><Send className="size-4 mr-2" /> {loading ? "Sending…" : "Submit Inquiry"}</Button>
          </form>
        </div>
      </SiteLayout>
    );
  };
}

export const Route = createFileRoute("/bulk-orders")({
  head: () => ({ meta: [{ title: "Bulk Orders — Ganesha Rangoli" }] }),
  component: makeInquiryPage({ slug: "bulk-orders", eyebrow: "Volume pricing", title: "Bulk Orders", description: "Order rangolis in bulk for events, retail, and large gatherings. Special pricing applies on 25+ pieces.", category: "Bulk Order", icon: Package }),
});
