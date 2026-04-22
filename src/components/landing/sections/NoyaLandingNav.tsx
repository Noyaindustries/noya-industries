import { LANDING_IMG } from "../landingAssets";
export function NoyaLandingNav() {
  return (
    <>
      <nav className="nav" id="nav">
        <a href="/" className="nav-logo"><img src={LANDING_IMG.brandMark} alt="Noya Industries" /></a>
        <div className="nav-mid">
          <a href="/histoire">Histoire</a>
          <a href="/poles">Pôles</a>
          <a href="/produits">Produits</a>
          <a href="/expertise">Expertise</a>
          <a href="/equipe">Équipe</a>
          <a href="/contact">Contact</a>
        </div>
        <div className="nav-right">
          <button type="button" className="nav-lux-toggle" data-lux-toggle aria-label="Basculer le preset visuel luxe">
            Mode
            <span className="nav-lux-value" data-lux-label>Showroom</span>
          </button>
          <a href="/contact" className="nav-primary">
            <span className="nav-primary-title">Travailler avec nous</span>
            <span className="nav-primary-meta">Recrutement</span>
            <span className="nav-primary-arrow" aria-hidden="true">
              <svg width={14} height={14} fill="none" viewBox="0 0 14 14">
                <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </nav>

    </>
  );
}
