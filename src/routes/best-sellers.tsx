import { createFileRoute } from "@tanstack/react-router";
import { ProductListPage } from "@/components/site/ProductListPage";
export const Route = createFileRoute("/best-sellers")({
  head: () => ({ meta: [{ title: "Best Sellers — Ganesha Rangoli" }] }),
  component: () => <ProductListPage eyebrow="Customer favourites" title={<>Best <span className="gradient-text">Sellers</span></>} description="Our most-loved rangolis, by thousands of customers." crumb={{ to: "/best-sellers", label: "Best Sellers" }} queryKey="best-sellers" filter={{ is_best_seller: true }} />,
});
