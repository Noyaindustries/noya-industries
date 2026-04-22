import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingProducts } from "@/components/landing/sections/NoyaLandingProducts";

export default function ProduitsPage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingPageIntro
        eyebrow="Produits"
        title={
          <>
            Des solutions pensées
            <br />
            <em>pour le terrain africain</em>
          </>
        }
        lead="PADDE-CI et Infinite Core traduisent notre expertise opérationnelle en produits clairs, déployables rapidement et adaptés au contexte local."
        kicker="Produits conçus pour la réalité opérationnelle des entreprises africaines"
        theme="violet"
        metrics={[
          { value: "2", label: "produits phares actifs" },
          { value: "7", label: "modules Infinite Core" },
          { value: "5-7j", label: "fenêtre de déploiement" },
        ]}
        primaryAction={{ href: "https://padde-ci.com/", label: "Explorer PADDE-CI" }}
        secondaryAction={{ href: "https://www.infinitecore.net/", label: "Explorer Infinite Core" }}
      />
      <NoyaLandingProducts />
    </NoyaLandingPageChrome>
  );
}
