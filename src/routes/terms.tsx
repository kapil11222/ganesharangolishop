import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Ganesha Rangoli" }] }),
  component: () => (
    <LegalPage title="Terms & Conditions" eyebrow="The fine print" crumb={{ to: "/terms", label: "Terms" }}>
      <p>By using ganesharangoli.com you agree to these terms.</p>
      <h2>Orders & pricing</h2>
      <p>All prices are in INR and inclusive of applicable taxes unless stated. We reserve the right to cancel any order due to pricing errors or stock issues, with a full refund.</p>
      <h2>Intellectual property</h2>
      <p>All designs, images, and content are © Ganesha Rangoli. Reproduction without written consent is prohibited.</p>
      <h2>User accounts</h2>
      <p>You are responsible for keeping your account credentials secure. Notify us immediately of any unauthorized use.</p>
      <h2>Liability</h2>
      <p>Our liability is limited to the order value. We are not responsible for indirect or consequential damages.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Any disputes will be resolved in Maharashtra courts.</p>
    </LegalPage>
  ),
});
