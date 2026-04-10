type StatItem = {
  label: string;
  value: string;
  order: number;
};

export function Impact({ stats }: { stats: StatItem[] }) {
  return (
    <section id="impact" className="scroll-mt-28 px-6 py-24 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="card-premium relative overflow-hidden rounded-3xl px-8 py-14 lg:px-16 lg:py-16">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(212,175,55,0.08),transparent_55%)]"
          />
          <div className="relative">
            <p className="font-[family-name:var(--font-dm-mono)] mb-3 text-[11px] uppercase tracking-[0.28em] text-noya-gold-soft">
              Impact mesurable
            </p>
            <h2 className="font-[family-name:var(--font-fraunces)] max-w-xl text-2xl font-medium text-noya-text lg:text-3xl">
              Des indicateurs qui reflètent la confiance de nos partenaires.
            </h2>
            <dl className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.22em] text-noya-faint">
                    {s.label}
                  </dt>
                  <dd className="font-[family-name:var(--font-fraunces)] mt-3 text-4xl font-medium tracking-tight text-gradient-gold">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
