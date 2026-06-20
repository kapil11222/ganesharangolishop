import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, MessageCircle, Phone, Mail, Send, Package, CreditCard, RefreshCw, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help Center — Ganesha Rangoli" }] }),
  component: HelpPage,
});

function HelpPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", order_number: "", category: "Order Issue", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from("support_tickets").insert(form).select().single();
    setLoading(false);
    if (error) toast.error("Couldn't submit"); else { toast.success(`Ticket created: ${data.ticket_number}`); setForm({ name: "", email: "", phone: "", order_number: "", category: "Order Issue", subject: "", message: "" }); }
  };
  return (
    <SiteLayout>
      <PageHeader eyebrow="Support" title={<>Help <span className="gradient-text">Center</span></>} description="Find answers fast or raise a support ticket — our team responds within 24 hours." crumbs={[{ to: "/help", label: "Help" }]} />
      <div className="container-luxe pb-20 space-y-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { i: Package, t: "Order & Shipping", to: "/track-order" },
            { i: CreditCard, t: "Payments", to: "/faqs" },
            { i: RefreshCw, t: "Returns & Refunds", to: "/refund" },
            { i: HelpCircle, t: "FAQs", to: "/faqs" },
          ].map((c) => (
            <Link key={c.t} to={c.to} className="glass rounded-2xl p-5 hover:shadow-glow transition text-center group">
              <c.i className="size-7 mx-auto text-primary mb-2 group-hover:scale-110 transition" />
              <div className="font-display font-bold">{c.t}</div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-3 lg:col-span-1">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold flex items-center gap-2"><MessageCircle className="size-4 text-primary" /> WhatsApp</h3>
              <a className="text-primary text-sm mt-1 block" href="https://wa.me/919209063985">+91 9209063985</a>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold flex items-center gap-2"><Phone className="size-4 text-primary" /> Phone</h3>
              <a className="text-primary text-sm mt-1 block" href="tel:+919209063985">+91 9209063985</a>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold flex items-center gap-2"><Mail className="size-4 text-primary" /> Email</h3>
              <a className="text-primary text-sm mt-1 block break-all" href="mailto:info.ganesharangoli@gmail.com">info.ganesharangoli@gmail.com</a>
            </div>
          </div>

          <form onSubmit={submit} className="glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4 lg:col-span-2">
            <h3 className="font-display text-xl font-bold flex items-center gap-2"><LifeBuoy className="size-5 text-primary" /> Raise a ticket</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Order number (if any)" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {["Order Issue","Payment Issue","Return","Replacement","Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <Input placeholder="Subject *" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <Textarea required rows={5} placeholder="Describe your issue *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" disabled={loading} className="rounded-full h-11 px-7 gradient-festive border-0 shadow-glow"><Send className="size-4 mr-2" /> {loading ? "Submitting…" : "Submit ticket"}</Button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}
