import { LANDING_IMG } from "../landingAssets";
export function NoyaLandingFooter() {
  return (
    <>
      <footer>
        <div className="ft-grid">
          <div>
            <div className="ft-brand-logo"><img src={LANDING_IMG.brandMark} alt="Noya Industries" /></div>
            <div className="ft-brand">
              <p>Groupe africain d&apos;innovation fondé à Abidjan en 2021. Consulting, Tech, Academy et Startup Studio pour les entreprises et institutions d&apos;Afrique francophone.</p>
            </div>
            <div className="ft-social">
              <a href="#" className="ft-soc soc-linkedin" title="LinkedIn">in</a>
              <a href="#" className="ft-soc soc-facebook" title="Facebook">f</a>
              <a href="#" className="ft-soc soc-instagram" title="Instagram" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.4" cy="6.8" r="1.3" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="ft-soc soc-tiktok" title="TikTok" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14.5 4v8.4a4.1 4.1 0 1 1-2.8-3.9V4h2.8Zm0 0c.7 2 2 3.1 4 3.4v2.5c-1.8-.1-3.2-.7-4-1.6V4Z" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="ft-soc soc-x" title="X / Twitter">𝕏</a>
              <a href="#" className="ft-soc soc-youtube" title="YouTube">▶</a>
            </div>
          </div>
          <div className="ft-col"><h5>Pôles</h5><ul><li><a href="/poles">Consulting</a></li><li><a href="/poles">Tech &amp; SaaS</a></li><li><a href="/poles">Academy</a></li><li><a href="/poles">Startup Studio</a></li></ul></div>
          <div className="ft-col"><h5>Produits</h5><ul><li><a href="https://padde-ci.com/" target="_blank" rel="noopener noreferrer">PADDE-CI ↗</a></li><li><a href="https://www.infinitecore.net/" target="_blank" rel="noopener noreferrer">Infinite Core ↗</a></li><li><a href="/presenz">PRESENZ ↗</a></li><li><a href="#">NYImmobilier — Bientôt</a></li></ul></div>
          <div className="ft-col"><h5>Groupe</h5><ul><li><a href="/histoire">Notre histoire</a></li><li><a href="/equipe">L'équipe</a></li><li><a href="/expertise">Expertise</a></li><li><a href="/contact">Contact</a></li></ul></div>
          <div className="ft-col"><h5>Contact</h5><ul><li><a href="tel:+2250103015467">+225 01 03 015 467</a></li><li><a href="mailto:contact@padde-ci.ci">contact@padde-ci.ci</a></li><li><a href="#">WhatsApp</a></li><li><a href="#">Abidjan, Riviera, CI</a></li></ul></div>
        </div>
        <div className="ft-bottom">
          <span className="ft-copy">© 2026 Noya Industries · Abidjan, Côte d'Ivoire · Tous droits réservés</span>
          <span className="ft-tagline">Bâtir l'Afrique de demain.</span>
          <div className="ft-legal"><a href="#">Mentions légales</a><a href="#">Confidentialité</a></div>
        </div>
      </footer>

    </>
  );
}
