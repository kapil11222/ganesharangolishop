import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — Ganesha Rangoli" }] }),
  component: () => (
    <LegalPage title="Refund Policy" eyebrow="Hassle-free" crumb={{ to: "/refund", label: "Refunds" }}>
      <p>We want you to love your rangoli. If something's not right, we'll make it right.</p>
      <h2>7-day returns</h2>
      <p>Return unused, undamaged items within 7 days of delivery for a full refund (excluding shipping).</p>
      <h2>How to return</h2>
      <ul><li>Email info.ganesharangoli@gmail.com or WhatsApp +91 9209063985 with your order number</li><li>We'll arrange a pickup or share a return address</li><li>Refund credited within 5-7 business days after we receive the return</li></ul>
      <h2>Non-returnable</h2>
      <ul><li>Custom-made rangolis</li><li>Bulk/corporate orders</li><li>Items damaged due to misuse</li></ul>
      <h2>Damaged in transit?</h2>
      <p>Send us a photo within 48 hrs of delivery and we'll send a free replacement.</p>
    </LegalPage>
  ),
});
