import type { ReactNode } from "react";

export function LegalArticle({
  kicker = "Informations",
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {kicker}
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="pt-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
