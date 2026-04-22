const POLE_JUMP = [
  { href: "#pole-consulting", label: "Consulting", cls: "pj-c" },
  { href: "#pole-tech", label: "Tech & SaaS", cls: "pj-t" },
  { href: "#pole-academy", label: "Academy", cls: "pj-a" },
  { href: "#pole-ventures", label: "Startup Studio", cls: "pj-v" },
] as const;

export function NoyaLandingPoles() {
  return (
    <>
      <section className="sec-full poles-bg" id="poles">
        <div className="inner">
          <div className="poles-hdr">
            <p className="eyebrow rv">4 pôles d&apos;activité</p>
            <h2 className="display rv">
              Découvrir nos <em>pôles</em>
            </h2>
            <p className="poles-tagline rv d1">
              Une expertise complète pour chaque <em>défi africain</em> — du conseil aux produits, de la
              formation à la co-création d&apos;entreprises.
            </p>
            <p className="poles-lede rv d2">
              Chaque pôle porte une mission distincte avec la même exigence : des livrables concrets,
              pensés pour le terrain ivoirien et la réalité des marchés francophones.
            </p>
            <nav className="poles-jump rv d3" aria-label="Accès rapide aux pôles">
              {POLE_JUMP.map(({ href, label, cls }) => (
                <a key={href} href={href} className={`poles-jump-link ${cls}`}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="poles-grid">
            <div className="pole pole-c rs rv" id="pole-consulting">
              <div className="pole-top">
                <div className="pole-icon">📊</div>
                <div className="pole-badge pb-gold">Consulting</div>
              </div>
              <div className="pole-name">Consulting</div>
              <div className="pole-sub">Stratégie, audit et transformation depuis 2021</div>
              <div className="pole-desc">Notre cœur de métier depuis le premier jour. Nous accompagnons PME, grandes entreprises et institutions publiques dans leur diagnostic, leur stratégie commerciale et leur transformation opérationnelle avec des livrables concrets et mesurables.</div>
              <ul className="pole-list">
                <li>Audit Rapide — Diagnostic digital complet en 48h</li>
                <li>Audit Business — Analyse approfondie en 5 jours</li>
                <li>Audit Institutionnel — Pour grandes structures</li>
                <li>Stratégie marketing &amp; développement commercial</li>
                <li>Community Management — 3 formules</li>
                <li>Coaching dirigeants et équipes commerciales</li>
              </ul>
              <a href="https://padde-ci.com/" className="pole-link" target="_blank" rel="noopener noreferrer">Voir PADDE-CI <svg width={13} height={13} fill="none" viewBox="0 0 13 13"><path d="M3 6.5h7M7 3.5 10 6.5 7 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></a>
            </div>
            <div className="pole pole-t rs rv d1" id="pole-tech">
              <div className="pole-top">
                <div className="pole-icon">⚡</div>
                <div className="pole-badge pb-blue">Tech &amp; SaaS</div>
              </div>
              <div className="pole-name">Tech</div>
              <div className="pole-sub">Logiciels, plateformes et produits numériques africains</div>
              <div className="pole-desc">De la vitrine web professionnelle à la suite SaaS modulaire complète. Notre pôle Tech conçoit et opère des solutions digitales taillées pour le contexte africain — réglementaire, opérationnel et économique.</div>
              <ul className="pole-list">
                <li>PRESENZ — Sites professionnels livrés en 7 jours</li>
                <li>Infinite Core — Suite SaaS 7 modules intégrés</li>
                <li>Infinite System — White label &amp; Enterprise</li>
                <li>Développement d'applications web et mobile sur mesure</li>
                <li>Dashboards, outils décisionnels et automatisation</li>
                <li>Maintenance et hébergement VPS sécurisé</li>
              </ul>
              <a href="https://www.infinitecore.net/" className="pole-link" target="_blank" rel="noopener noreferrer">Voir Infinite Core <svg width={13} height={13} fill="none" viewBox="0 0 13 13"><path d="M3 6.5h7M7 3.5 10 6.5 7 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></a>
            </div>
            <div className="pole pole-a rs rv d2" id="pole-academy">
              <div className="pole-top">
                <div className="pole-icon">🎓</div>
                <div className="pole-badge pb-green">Formation</div>
              </div>
              <div className="pole-name">Academy</div>
              <div className="pole-sub">Développer les compétences qui transforment</div>
              <div className="pole-desc">Noya Academy transfère l'expertise opérationnelle du groupe aux professionnels africains. Des formations courtes aux programmes certifiants — en présentiel à Abidjan ou en ligne via notre plateforme Infinite Academy.</div>
              <ul className="pole-list">
                <li>Formations digitales courtes — 1 à 5 jours</li>
                <li>Ateliers de transformation d'entreprise sur site</li>
                <li>Formations en ligne sur Infinite Academy (LMS)</li>
                <li>Certifications en outils de gestion digitale</li>
                <li>Coaching individuel dirigeants et managers</li>
                <li>Partenariats avec écoles et institutions ivoiriennes</li>
              </ul>
              <div className="pole-more">
                <input type="checkbox" id="academy-more-toggle" className="pole-more-toggle" />
                <label htmlFor="academy-more-toggle" className="pole-link pole-more-btn">
                  En savoir plus
                  <svg
                    width={13}
                    height={13}
                    fill="none"
                    viewBox="0 0 13 13"
                    aria-hidden="true"
                    className="pole-more-arrow"
                  >
                    <path d="M3 6.5h7M7 3.5 10 6.5 7 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </label>
                <div className="pole-more-content" id="academy-more-content">
                  <p>
                    Nos parcours Academy sont pensés pour des équipes opérationnelles : cas pratiques,
                    templates actionnables et suivi post-formation pour ancrer les acquis.
                  </p>
                  <ul>
                    <li>Parcours certifiants : Marketing digital, CRM, Productivité et pilotage.</li>
                    <li>Formats entreprise : sessions intra/inter, bootcamps et accompagnement terrain.</li>
                    <li>Accompagnement RH : plan de montée en compétences par département.</li>
                  </ul>
                  <a href="/contact">Parler à un conseiller Academy</a>
                </div>
              </div>
            </div>
            <div className="pole pole-v rs rv d3" id="pole-ventures">
              <div className="pole-top">
                <div className="pole-icon">🚀</div>
                <div className="pole-badge pb-purple">Startup Studio</div>
              </div>
              <div className="pole-name">Startup Studio</div>
              <div className="pole-sub">Co-fonder les entreprises africaines de demain</div>
              <div className="pole-desc">Le Startup Studio de Noya identifie, structure et accélère des opportunités de marché à fort potentiel en Afrique francophone. Infrastructure juridique et technologique partagée, réseau stratégique et capital opérationnel pour aller de la phase 0 au premier lancement.</div>
              <ul className="pole-list">
                <li>Validation et étude de marché Africa First</li>
                <li>Co-fondation et structuration juridique OHADA</li>
                <li>Infrastructure tech &amp; légale partagée du groupe</li>
                <li>Accès au réseau Noya et partenaires stratégiques</li>
                <li>Accompagnement de la phase 0 au lancement</li>
                <li>Poids Baoule, African concept store, NYimmobilier, Noya Tv, Infinite core, Padde Ci…</li>
              </ul>
              <a href="/recrutement" className="pole-link">Rejoindre notre startup studio <svg width={13} height={13} fill="none" viewBox="0 0 13 13"><path d="M3 6.5h7M7 3.5 10 6.5 7 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
