import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Ganesha Rangoli" }] }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) toast.error("Couldn't send message");
    else { toast.success("Message sent! We'll be in touch soon."); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="Get in touch" title={<>We'd love to <span className="gradient-text">hear from you</span></>} description="Questions, bulk orders, custom designs — we're a message away." crumbs={[{ to: "/contact", label: "Contact" }]} />
      <div className="container-luxe pb-20 grid lg:grid-cols-3 gap-8">
        <div className="space-y-4 lg:col-span-1">
          {[
            { i: Phone, t: "Call us", v: "+91 9209063985", href: "tel:+919209063985" },
            { i: MessageCircle, t: "WhatsApp", v: "+91 9209063985", href: "https://wa.me/919209063985" },
            { i: Mail, t: "Email", v: "info.ganesharangoli@gmail.com", href: "mailto:info.ganesharangoli@gmail.com" },
            { i: MapPin, t: "Location", v: "Maharashtra, India" },
            { i: Clock, t: "Hours", v: "Mon-Sat, 10am-7pm IST" },
          ].map((c) => (
            <a key={c.t} href={c.href ?? "#"} className="block glass rounded-2xl p-5 hover:shadow-glow transition">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full gradient-festive grid place-items-center text-primary-foreground"><c.i className="size-5" /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</div>
                  <div className="font-semibold">{c.v}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <form onSubmit={submit} className="lg:col-span-2 glass-strong rounded-3xl p-6 md:p-8 shadow-luxe space-y-4">
          <h2 className="font-display text-2xl font-bold">Send us a message</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input placeholder="Your name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <Textarea placeholder="How can we help? *" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Button type="submit" disabled={loading} className="rounded-full h-11 px-7 gradient-festive border-0 shadow-glow"><Send className="size-4 mr-2" /> {loading ? "Sending…" : "Send message"}</Button>
        </form>
      </div>
    </SiteLayout>
  );
}
