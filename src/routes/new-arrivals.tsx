import { createFileRoute } from "@tanstack/react-router";
import { ProductListPage } from "@/components/site/ProductListPage";
export const Route = createFileRoute("/new-arrivals")({
  head: () => ({ meta: [{ title: "New Arrivals — Ganesha Rangoli" }] }),
  component: () => <ProductListPage eyebrow="Fresh drops" title={<>New <span className="gradient-text">Arrivals</span></>} description="The latest designs in our collection." crumb={{ to: "/new-arrivals", label: "New Arrivals" }} queryKey="new-arrivals" filter={{ is_new_arrival: true }} />,
});
