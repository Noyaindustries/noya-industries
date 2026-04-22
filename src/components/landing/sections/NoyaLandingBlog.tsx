export function NoyaLandingBlog() {
  return (
    <>
      <section className="sec-full blog-bg" id="blog">
        <div className="inner">
          <p className="eyebrow rv">Expertise &amp; Insights</p>
          <h2 className="display rv d1">Ce que nous savons,<br /><em>nous le partageons.</em></h2>
          <p className="lead rv d2">Analyses, études de cas et guides pratiques sur la transformation des entreprises africaines — publiés par nos équipes terrain.</p>
          <div className="blog-grid">
            <div className="article article-feat rv">
              <div className="article-cat ac-gold">Consulting</div>
              <div className="article-title">Pourquoi 70% des PME ivoiriennes échouent leur transformation digitale — et comment l'éviter</div>
              <div className="article-excerpt">Après 100+ audits menés en Côte d'Ivoire, notre équipe a identifié 5 erreurs systématiques : absence de diagnostic initial, choix technologiques inadaptés au contexte, résistance au changement non anticipée... Analyse complète avec les solutions concrètes.</div>
              <div className="article-footer"><span className="article-date">Mars 2026</span><span className="article-cta">Lire <svg width={11} height={11} fill="none" viewBox="0 0 11 11"><path d="M2 5.5h7M5.5 2.5 8.5 5.5 5.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span></div>
              <div className="article-num">01</div>
            </div>
            <div className="article rv d1">
              <div className="article-cat ac-blue">Tech</div>
              <div className="article-title">CRM vs WhatsApp : vos équipes commerciales perdent 30% de leur efficacité</div>
              <div className="article-excerpt">Étude menée auprès de 50 équipes commerciales ivoiriennes. Les résultats sont sans appel — et les solutions, accessibles.</div>
              <div className="article-footer"><span className="article-date">Fév. 2026</span><span className="article-cta">Lire <svg width={11} height={11} fill="none" viewBox="0 0 11 11"><path d="M2 5.5h7M5.5 2.5 8.5 5.5 5.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span></div>
              <div className="article-num">02</div>
            </div>
            <div className="article rv d2" style={{borderRight: 'none'}}>
              <div className="article-cat ac-green">Academy</div>
              <div className="article-title">Les 5 compétences digitales indispensables pour manager en Afrique en 2026</div>
              <div className="article-excerpt">Data literacy, outils collaboratifs, leadership digital — le panorama établi par notre équipe Academy après 3 ans de formation.</div>
              <div className="article-footer"><span className="article-date">Janv. 2026</span><span className="article-cta">Lire <svg width={11} height={11} fill="none" viewBox="0 0 11 11"><path d="M2 5.5h7M5.5 2.5 8.5 5.5 5.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span></div>
              <div className="article-num">03</div>
            </div>
          </div>
          <div className="blog-row2 rv">
            <div className="article-mini">
              <div className="article-cat ac-purple" style={{fontSize: '9.5px'}}>Startup Studio</div>
              <div style={{fontFamily: '"Fraunces",serif', fontSize: 15, fontWeight: 600, letterSpacing: '-.02em', lineHeight: '1.35'}}>Créer une startup en Côte d'Ivoire en 2026 : le guide OHADA</div>
              <div style={{fontFamily: '"DM Mono",monospace', fontSize: '10.5px', color: 'var(--fog)'}}>Déc. 2025</div>
            </div>
            <div className="article-mini">
              <div className="article-cat ac-gold" style={{fontSize: '9.5px'}}>Consulting</div>
              <div style={{fontFamily: '"Fraunces",serif', fontSize: 15, fontWeight: 600, letterSpacing: '-.02em', lineHeight: '1.35'}}>Audit digital en 48h : ce que révèle vraiment votre présence en ligne</div>
              <div style={{fontFamily: '"DM Mono",monospace', fontSize: '10.5px', color: 'var(--fog)'}}>Nov. 2025</div>
            </div>
            <div className="article-mini">
              <div className="article-cat ac-blue" style={{fontSize: '9.5px'}}>Tech</div>
              <div style={{fontFamily: '"Fraunces",serif', fontSize: 15, fontWeight: 600, letterSpacing: '-.02em', lineHeight: '1.35'}}>Votre site web ivoirien doit être mobile-first — les données le prouvent</div>
              <div style={{fontFamily: '"DM Mono",monospace', fontSize: '10.5px', color: 'var(--fog)'}}>Oct. 2025</div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
