import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Ganesha Rangoli" }] }),
  component: () => (
    <LegalPage title="Privacy Policy" eyebrow="Your data, your control" crumb={{ to: "/privacy", label: "Privacy" }}>
      <p>At Ganesha Rangoli, we respect your privacy and are committed to protecting your personal information.</p>
      <h2>Information we collect</h2>
      <ul><li>Contact details: name, email, phone, address</li><li>Order history and preferences</li><li>Payment-related metadata (we never store card numbers)</li><li>Device and usage data for analytics</li></ul>
      <h2>How we use it</h2>
      <ul><li>Fulfilling and shipping orders</li><li>Customer support and order updates</li><li>Improving our products and website</li><li>Sending optional marketing (you can unsubscribe anytime)</li></ul>
      <h2>Your rights</h2>
      <p>You can request access, correction, or deletion of your data anytime by emailing info.ganesharangoli@gmail.com.</p>
      <h2>Security</h2>
      <p>All data is stored on encrypted servers. Payments are processed via secure channels. We never sell your data.</p>
    </LegalPage>
  ),
});
