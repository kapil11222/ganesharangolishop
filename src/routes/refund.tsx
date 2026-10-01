import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — Ganesha Rangoli" }] }),
  component: () => (
    <LegalPage title="Refund & Exchange Policy" eyebrow="Hassle-free" crumb={{ to: "/refund", label: "Refunds" }}>
      <p>We pack every rangoli carefully, but if something goes wrong, we'll make it right. Please read the conditions below before raising a return request.</p>
      <h2>When can you return or exchange?</h2>
      <p>Return or exchange is accepted <strong>only</strong> in these two cases:</p>
      <ul>
        <li>The product arrived <strong>damaged</strong> (broken, torn, or crushed in transit)</li>
        <li>You received the <strong>wrong product</strong> (different design, size, or item than what you ordered)</li>
      </ul>
      <p>We do not accept returns or exchanges for any other reason — including change of mind, "didn't like it after seeing it in person", or ordering the wrong size/design yourself. Please read the product description, photos, and size details carefully before ordering.</p>
      <h2>Unboxing video is mandatory</h2>
      <p>For any damaged or wrong-product claim, an <strong>unboxing/unpacking video is required</strong> — no exceptions:</p>
      <ul>
        <li>Record a continuous video while opening the sealed package, from the outside of the parcel to the product being fully visible</li>
        <li>Do not pause, cut, or edit the video</li>
        <li>The video must clearly show the order label / packaging of the parcel</li>
        <li>Claims without a valid unboxing video cannot be processed</li>
      </ul>
      <p>This protects both sides — it lets us confirm the issue and claim it from our courier partner.</p>
      <h2>How to raise a claim</h2>
      <ul><li>Within 48 hours of delivery, email info.ganesharangoli@gmail.com or WhatsApp +91 9209063985 with your order number, photos of the product, and the unboxing video</li><li>Once verified, we'll arrange a free pickup or share a return address</li><li>After approval, you get a replacement or a full refund (excluding any COD handling fee) credited within 5-7 business days of receiving the return</li></ul>
      <h2>Damaged in transit?</h2>
      <p>Send us the unboxing video and photos within 48 hrs of delivery and we'll send a free replacement — no charges.</p>
      <h2>Wrong product received?</h2>
      <p>Share the unboxing video showing what arrived — we'll pick it up free of cost and ship the correct product right away, or refund you in full if you prefer.</p>
    </LegalPage>
  ),
});
