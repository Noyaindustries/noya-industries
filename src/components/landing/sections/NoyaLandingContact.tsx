type NoyaLandingContactProps = {
  mode?: "contact" | "recruitment";
};

export function NoyaLandingContact({ mode = "contact" }: NoyaLandingContactProps) {
  const isRecruitment = mode === "recruitment";
  return (
    <>
      <section className="sec-full contact-bg-premium" id="contact">
        {/* Decorative floating orbs */}
        <div className="contact-orb contact-orb-1" aria-hidden="true" />
        <div className="contact-orb contact-orb-2" aria-hidden="true" />
        <div className="contact-orb contact-orb-3" aria-hidden="true" />
        <div className="contact-grid-pattern" aria-hidden="true" />

        <div className="inner">
          <div className="contact-header-premium rv">
            <div className="contact-badge-row">
              <span className="contact-badge">
                <span className="contact-badge-dot" />
                Disponible — Réponse sous 24h
              </span>
            </div>
            <h2 className="contact-headline rv d1">
              {isRecruitment ? (
                <>
                  Rejoignez
                  <br />
                  <span className="contact-headline-accent">l&apos;aventure.</span>
                </>
              ) : (
                <>
                  Parlons de votre
                  <br />
                  <span className="contact-headline-accent">projet.</span>
                </>
              )}
            </h2>
            <p className="contact-lead rv d2">
              {isRecruitment ? (
                <>
                  Transmettez votre candidature : notre équipe RH étudie chaque
                  profil avec attention et revient vers les candidatures retenues.
                </>
              ) : (
                <>
                  Audit, site web, logiciel de gestion, formation ou startup studio
                  — notre équipe analyse votre besoin et vous oriente vers la
                  solution adaptée en moins de 24h.
                </>
              )}
            </p>
          </div>

          <div className="contact-layout-premium">
            {/* Left — Info cards */}
            <div className="contact-info-col">
              <div className="contact-card-glass rv d2">
                <div className="ccg-icon-wrap">
                  <div className="ccg-icon">📍</div>
                </div>
                <div className="ccg-content">
                  <div className="ccg-label">Siège social</div>
                  <div className="ccg-value">
                    Abidjan, Riviera — Côte d&apos;Ivoire
                  </div>
                </div>
                <div className="ccg-shine" aria-hidden="true" />
              </div>

              <div className="contact-card-glass rv d3">
                <div className="ccg-icon-wrap">
                  <div className="ccg-icon">📞</div>
                </div>
                <div className="ccg-content">
                  <div className="ccg-label">Téléphone</div>
                  <div className="ccg-value">
                    +225 01 03 015 467
                    <br />
                    +225 05 76 66 60 79
                  </div>
                </div>
                <div className="ccg-shine" aria-hidden="true" />
              </div>

              <div className="contact-card-glass rv d3">
                <div className="ccg-icon-wrap">
                  <div className="ccg-icon">✉️</div>
                </div>
                <div className="ccg-content">
                  <div className="ccg-label">Email</div>
                  <div className="ccg-value">services@noyaindustries.com</div>
                </div>
                <div className="ccg-shine" aria-hidden="true" />
              </div>

              <div className="contact-card-glass rv d4">
                <div className="ccg-icon-wrap">
                  <div className="ccg-icon">💬</div>
                </div>
                <div className="ccg-content">
                  <div className="ccg-label">WhatsApp</div>
                  <div className="ccg-value">
                    Réponse garantie sous 24h ouvrables
                  </div>
                </div>
                <div className="ccg-shine" aria-hidden="true" />
              </div>

              {/* Pole shortcuts */}
              <div className="contact-poles-premium rv d5">
                <div className="cp-label">Accès rapide aux pôles</div>
                <div className="cp-grid">
                  <a
                    className="cp-link"
                    href="https://padde-ci.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="cp-icon">📊</span>
                    <span>PADDE-CI</span>
                    <span className="cp-arrow">→</span>
                  </a>
                  <a
                    className="cp-link"
                    href="https://www.infinitecore.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="cp-icon">⚡</span>
                    <span>Infinite Core</span>
                    <span className="cp-arrow">→</span>
                  </a>
                  <a className="cp-link" href="/poles">
                    <span className="cp-icon">🎓</span>
                    <span>Academy</span>
                    <span className="cp-arrow">→</span>
                  </a>
                  <a className="cp-link" href="/poles">
                    <span className="cp-icon">🚀</span>
                    <span>Startup Studio</span>
                    <span className="cp-arrow">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="contact-form-premium rs rv d1">
              <div className="cfp-glow" aria-hidden="true" />
              <div className="cfp-border-shine" aria-hidden="true" />
              <div className="cfp-header cfp-header--compact">
                <div className="cfp-header-badge">
                  {isRecruitment ? "Candidature" : "Concierge"}
                </div>
                <div className="cfp-title">
                  {isRecruitment ? "Postuler" : "Message"}
                </div>
                <div className="cfp-subtitle">
                  {isRecruitment
                    ? "Parcours et motivation ci-dessous."
                    : "Réponse sous 24h ouvrables."}
                </div>
              </div>
              <div
                id="noya-landing-contact-root"
                data-form-mode={mode === "recruitment" ? "recruitment" : "contact"}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
