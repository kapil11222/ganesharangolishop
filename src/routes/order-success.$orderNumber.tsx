import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, Home as HomeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order-success/$orderNumber")({
  component: SuccessPage,
});

function SuccessPage() {
  const { orderNumber } = Route.useParams();
  return (
    <SiteLayout>
      <div className="container-luxe py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center glass-strong rounded-3xl p-10 md:p-16 shadow-luxe">
          <div className="size-20 rounded-full gradient-festive grid place-items-center mx-auto shadow-glow">
            <CheckCircle2 className="size-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-6">Order <span className="gradient-text">Confirmed</span></h1>
          <p className="text-muted-foreground mt-3">Thank you for your purchase! Your order has been placed successfully.</p>
          <div className="mt-7 inline-block glass rounded-2xl px-6 py-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Order Number</div>
            <div className="font-display text-2xl font-bold text-primary">{orderNumber}</div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Our team will call you from <strong>+91 9209063985</strong> to confirm your order.
          </div>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/track-order"><Button variant="outline" className="rounded-full"><Package className="size-4 mr-2" /> Track Order</Button></Link>
            <Link to="/"><Button className="rounded-full gradient-festive border-0 shadow-glow"><HomeIcon className="size-4 mr-2" /> Home</Button></Link>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
