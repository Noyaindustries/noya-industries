export function NoyaLandingHero() {
  return (
    <>
      <section className="hero">
        <div className="hero-ambient" />
        <div className="hero-main">
          <div className="hero-kicker">
            <div className="kicker-badge">N</div>
            <span className="kicker-text">Noya Industries</span>
            <div className="kicker-sep" />
            <span className="kicker-highlight">Groupe · Abidjan · 2021</span>
          </div>
          <h1 className="hero-h1">
            <span className="h-line h-plain">Innovation.</span>
            <span className="h-line h-italic">Technologie.</span>
            <span className="h-line h-cobalt">Afrique.</span>
          </h1>
          <p className="hero-sub">
            Depuis 2021, Noya Industries construit les entreprises africaines de demain avec une expertise de <strong>conseil stratégique</strong>, des <strong>produits digitaux de référence</strong> et une <strong>vision d'impact durable</strong> ancrée dans la réalité ivoirienne.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn-hero" data-scroll-to="poles">
              Découvrir nos pôles
              <svg width={14} height={14} fill="none" viewBox="0 0 14 14"><path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="btn-hero-out" data-scroll-to="contact">
              <svg width={14} height={14} fill="none" viewBox="0 0 14 14"><path d="M2 4.5 7 8l5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><rect x={1} y={3} width={12} height={8} rx="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>
              Nous contacter
            </button>
          </div>
        </div>
        <div className="hero-ticker">
          <div className="ticker-track">
            <div className="ticker-item"><div className="ti-dot" />Consulting Stratégique</div>
            <div className="ticker-item"><div className="ti-dot" />Marketing Digital</div>
            <div className="ticker-item"><div className="ti-dot" />Développement Web</div>
            <div className="ticker-item"><div className="ti-dot" />Audit Digital</div>
            <div className="ticker-item"><div className="ti-dot" />PADDE-CI</div>
            <div className="ticker-item"><div className="ti-dot" />PRESENZ</div>
            <div className="ticker-item"><div className="ti-dot" />Infinite Core SaaS</div>
            <div className="ticker-item"><div className="ti-dot" />Academy</div>
            <div className="ticker-item"><div className="ti-dot" />Startup Studio</div>
            <div className="ticker-item"><div className="ti-dot" />Abidjan · Côte d'Ivoire</div>
            {/* duplicate */}
            <div className="ticker-item"><div className="ti-dot" />Consulting Stratégique</div>
            <div className="ticker-item"><div className="ti-dot" />Marketing Digital</div>
            <div className="ticker-item"><div className="ti-dot" />Développement Web</div>
            <div className="ticker-item"><div className="ti-dot" />Audit Digital</div>
            <div className="ticker-item"><div className="ti-dot" />PADDE-CI</div>
            <div className="ticker-item"><div className="ti-dot" />PRESENZ</div>
            <div className="ticker-item"><div className="ti-dot" />Infinite Core SaaS</div>
            <div className="ticker-item"><div className="ti-dot" />Academy</div>
            <div className="ticker-item"><div className="ti-dot" />Startup Studio</div>
            <div className="ticker-item"><div className="ti-dot" />Abidjan · Côte d'Ivoire</div>
          </div>
        </div>
      </section>

    </>
  );
}
