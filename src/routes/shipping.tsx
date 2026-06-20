import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping Policy — Ganesha Rangoli" }] }),
  component: () => (
    <LegalPage title="Shipping Policy" eyebrow="Fast & free" crumb={{ to: "/shipping", label: "Shipping" }}>
      <p>We ship across India with trusted courier partners.</p>
      <h2>Delivery times</h2>
      <ul><li>Metro cities: 3-5 business days</li><li>Other cities: 5-7 business days</li><li>Remote areas: 7-10 business days</li></ul>
      <h2>Shipping charges</h2>
      <ul><li>Free shipping on orders above ₹999</li><li>Flat ₹79 on orders below ₹999</li><li>COD: ₹49 handling fee (waived on prepaid)</li></ul>
      <h2>Dispatch</h2>
      <p>Orders are dispatched within 24 hours (excluding Sundays & holidays). You'll receive a tracking link by SMS/email once shipped.</p>
      <h2>International shipping</h2>
      <p>WhatsApp us at +91 9209063985 for a custom international shipping quote.</p>
    </LegalPage>
  ),
});
