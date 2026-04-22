export function NoyaLandingTeam() {
  return (
    <>
      <section className="sec" id="team">
        <p className="eyebrow rv">L'équipe</p>
        <h2 className="display rv d1">Les personnes qui<br /><em>construisent le groupe.</em></h2>
        <div className="team-grid">
          <div className="team-card rv">
            <div className="team-av" style={{background: 'linear-gradient(135deg,var(--gold),var(--cobalt))'}}>YN</div>
            <div className="team-name">Yannick N'guessan</div>
            <div className="team-role" style={{color: 'var(--gold)'}}>Fondateur &amp; DG</div>
            <div className="team-desc">Entrepreneur et stratège digital. Fondateur de Noya Industries en 2021, il pilote la vision du groupe, les partenariats stratégiques et le développement de chaque nouveau pôle et produit.</div>
            <div className="team-skills"><span className="ts">Stratégie</span><span className="ts">Venture</span><span className="ts">Product</span><span className="ts">Business Dev</span></div>
          </div>
          <div className="team-card rv d1">
            <div className="team-av" style={{background: 'linear-gradient(135deg,var(--cobalt),#7C3AED)'}}>JL</div>
            <div className="team-name">Jean-Loïc Koné</div>
            <div className="team-role" style={{color: 'var(--cobalt3)'}}>Directeur Créatif</div>
            <div className="team-desc">Directeur artistique du groupe. Il est responsable de l'identité visuelle de Noya Industries et de l'ensemble des marques du portefeuille — de la charte graphique aux livrables clients finaux.</div>
            <div className="team-skills"><span className="ts">UI/UX</span><span className="ts">Branding</span><span className="ts">Motion</span><span className="ts">Figma</span></div>
          </div>
          <div className="team-card rv d2">
            <div className="team-av" style={{background: 'linear-gradient(135deg,#10B981,var(--cobalt))'}}>KS</div>
            <div className="team-name">Kouassi Stéphane</div>
            <div className="team-role" style={{color: '#34D399'}}>Ingénieur Fullstack</div>
            <div className="team-desc">Ingénieur logiciel fullstack, partenaire technique de Noya Industries. Il développe et déploie les plateformes PRESENZ, Infinite Core et les solutions digitales sur mesure pour les clients du groupe.</div>
            <div className="team-skills"><span className="ts">Next.js</span><span className="ts">Node.js</span><span className="ts">PostgreSQL</span><span className="ts">Strapi</span></div>
          </div>
        </div>
      </section>

    </>
  );
}
