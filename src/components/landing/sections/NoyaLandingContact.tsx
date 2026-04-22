type NoyaLandingContactProps = {
  mode?: "contact" | "recruitment";
};

export function NoyaLandingContact({ mode = "contact" }: NoyaLandingContactProps) {
  const isRecruitment = mode === "recruitment";
  return (
    <>
      <section className="sec-full contact-bg" id="contact">
        <div className="inner">
          <div className="contact-layout">
            <div>
              <p className="eyebrow rv">{isRecruitment ? "Recrutement" : "Contact"}</p>
              <h2 className="display rv d1">
                {isRecruitment ? (
                  <>
                    Candidatez pour
                    <br />
                    <em>rejoindre Noya</em>
                  </>
                ) : (
                  <>
                    Parlons de
                    <br />
                    votre projet.
                  </>
                )}
              </h2>
              <p className="lead rv d2">
                {isRecruitment
                  ? "Partagez votre profil, vos compétences et votre motivation. Notre équipe recrutement étudie chaque candidature et vous répond selon les opportunités ouvertes."
                  : "Audit, site web, logiciel de gestion, formation ou startup studio — notre équipe analyse votre besoin et vous oriente vers la solution adaptée en moins de 24h."}
              </p>
              <div className="contact-info-items">
                <div className="ci rv d2"><div className="ci-icon">📍</div><div><div className="ci-label">Siège social</div><div className="ci-value">Abidjan, Riviera — Côte d'Ivoire</div></div></div>
                <div className="ci rv d3"><div className="ci-icon">📞</div><div><div className="ci-label">Téléphone</div><div className="ci-value">+225 01 03 015 467 / 05 76 66 60 79</div></div></div>
                <div className="ci rv d4"><div className="ci-icon">✉️</div><div><div className="ci-label">Email</div><div className="ci-value">services@noyaindustries.com</div></div></div>
                <div className="ci rv d5"><div className="ci-icon">💬</div><div><div className="ci-label">WhatsApp</div><div className="ci-value">Réponse garantie sous 24h ouvrables</div></div></div>
              </div>
              <div className="pole-shortcuts rv d3">
                <a className="ps-item" href="https://padde-ci.com/" target="_blank" rel="noopener noreferrer"><span>📊</span>PADDE-CI</a>
                <a className="ps-item" href="https://www.infinitecore.net/" target="_blank" rel="noopener noreferrer"><span>⚡</span>Infinite Core</a>
                <a className="ps-item" href="/poles"><span>🎓</span>Academy</a>
                <a className="ps-item" href="/poles"><span>🚀</span>Startup Studio</a>
              </div>
            </div>
            <div className="contact-form rs rv d1">
              <div className="form-title">
                {isRecruitment ? "Déposer une candidature" : "Envoyer un message"}
              </div>
              <div
                id="noya-landing-contact-root"
                data-form-mode={isRecruitment ? "recruitment" : "contact"}
              />
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
