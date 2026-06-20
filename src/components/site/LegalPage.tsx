import type { ReactNode } from "react";
import { SiteLayout } from "./SiteLayout";
import { PageHeader } from "./PageHeader";

export function LegalPage({ title, eyebrow, crumb, children }: { title: string; eyebrow: string; crumb: { to: string; label: string }; children: ReactNode }) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={<>{title.split(" ").slice(0, -1).join(" ")} <span className="gradient-text">{title.split(" ").slice(-1)}</span></>} crumbs={[crumb]} />
      <div className="container-luxe pb-20 max-w-3xl">
        <div className="glass rounded-3xl p-7 md:p-10 shadow-card prose prose-sm md:prose-base dark:prose-invert max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:my-3 [&_li]:my-1 [&_li]:list-disc [&_li]:ml-5">
          {children}
          <p className="mt-10 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}. For questions, email info.ganesharangoli@gmail.com.</p>
        </div>
      </div>
    </SiteLayout>
  );
}
