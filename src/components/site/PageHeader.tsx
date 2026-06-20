import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  crumbs?: { to: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative pt-12 pb-10 md:pt-16 md:pb-14 gradient-hero">
      <div className="container-luxe">
        {crumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            {crumbs.map((c) => (
              <span key={c.to} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" />
                <Link to={c.to} className="hover:text-primary">{c.label}</Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] max-w-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
