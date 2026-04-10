export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-36 lg:px-8 lg:pb-36 lg:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-noya-forest/25 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#5c3d2e]/20 blur-[90px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-dm-mono)] mb-8 text-[11px] uppercase tracking-[0.35em] text-noya-faint">
          African Innovation &amp; Consulting Group
        </p>
        <h1 className="font-[family-name:var(--font-fraunces)] max-w-4xl text-[clamp(2.5rem,6vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.02em] text-noya-text">
          L’Afrique qui innove mérite un conseil{" "}
          <span className="text-gradient-gold italic">à la hauteur de ses ambitions</span>.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-noya-muted lg:text-xl">
          Noya Industries accompagne institutions, entreprises et fondateurs à clarifier la
          stratégie, accélérer l’innovation et structurer la transformation — avec une exigence
          comparable aux cabinets mondiaux et une profondeur de terrain africaine.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-5">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-noya-gold px-8 py-4 text-sm font-semibold tracking-wide text-[#1a1208] transition hover:bg-noya-gold-soft"
          >
            Discuter de votre projet
          </a>
          <a
            href="#services"
            className="font-[family-name:var(--font-dm-mono)] inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-noya-muted transition hover:text-noya-text"
          >
            <span className="hero-line h-px w-8 bg-noya-gold/60" aria-hidden />
            Découvrir nos expertises
          </a>
        </div>
      </div>
    </section>
  );
}
