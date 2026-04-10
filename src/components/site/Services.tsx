type ServiceItem = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  order: number;
};

export function Services({ services }: { services: ServiceItem[] }) {
  return (
    <section id="services" className="scroll-mt-28 border-t border-noya-line px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-[family-name:var(--font-dm-mono)] mb-4 text-[11px] uppercase tracking-[0.28em] text-noya-gold-soft">
            Expertises
          </p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium tracking-tight text-noya-text lg:text-4xl">
            Quatre leviers pour une organisation plus lucide et plus rapide.
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <article
              key={s.slug}
              className="card-premium group relative overflow-hidden rounded-2xl p-8 transition hover:border-noya-gold/25"
            >
              <span
                className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.3em] text-noya-faint"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-[family-name:var(--font-fraunces)] mt-4 text-2xl text-noya-text">
                {s.title}
              </h3>
              {s.subtitle ? (
                <p className="font-[family-name:var(--font-dm-mono)] mt-1 text-[11px] uppercase tracking-[0.2em] text-noya-gold/80">
                  {s.subtitle}
                </p>
              ) : null}
              <p className="mt-5 text-[15px] leading-relaxed text-noya-muted">{s.description}</p>
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-noya-gold/5 opacity-0 blur-2xl transition group-hover:opacity-100"
                aria-hidden
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
