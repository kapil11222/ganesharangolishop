import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Are these rangolis reusable?", a: "Yes! Our rangolis are made on premium velvet/fabric base — dust them off after use and store flat. They last for years." },
  { q: "What's the delivery time?", a: "We dispatch within 24 hours. Delivery typically takes 3-7 business days across India, depending on your pincode." },
  { q: "Is Cash on Delivery available?", a: "Yes, COD is available on most products and pincodes. You can also pay via UPI — we'll call you to confirm and collect payment securely." },
  { q: "Do you offer custom designs?", a: "Absolutely! Visit our Custom Orders page or WhatsApp us at +91 9209063985 with your idea." },
  { q: "What is the return policy?", a: "Returns or exchanges are accepted only if the product arrives damaged or you received the wrong product — an unboxing video is mandatory for such claims. See our Refund & Exchange Policy for full details." },
  { q: "Do you accept bulk/corporate orders?", a: "Yes, we offer special pricing and custom branding for bulk and corporate orders. Visit our Bulk Orders or Corporate Orders pages." },
  { q: "How do I clean the rangoli?", a: "Simply use a soft, dry cloth or a soft brush. For deeper cleaning, gentle wiping with a damp cloth works — avoid soaking." },
  { q: "Do you ship internationally?", a: "Currently we ship across India. For international shipping, please WhatsApp us for a custom quote." },
];

export const Route = createFileRoute("/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Ganesha Rangoli" }] }),
  component: () => (
    <SiteLayout>
      <PageHeader eyebrow="We're here to help" title={<>Frequently Asked <span className="gradient-text">Questions</span></>} description="Quick answers to the questions we hear most often." crumbs={[{ to: "/faqs", label: "FAQs" }]} />
      <div className="container-luxe pb-20 max-w-3xl">
        <Accordion type="single" collapsible className="glass-strong rounded-3xl p-2 md:p-4 shadow-luxe">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border-b last:border-0">
              <AccordionTrigger className="px-4 text-left font-display text-lg hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteLayout>
  ),
});
