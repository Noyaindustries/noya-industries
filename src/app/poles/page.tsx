import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingPoles } from "@/components/landing/sections/NoyaLandingPoles";

export default function PolesPage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingPageIntro
        eyebrow="Pôles"
        title={
          <>
            4 pôles pour exécuter
            <br />
            <em>de bout en bout</em>
          </>
        }
        lead="Conseil, tech, academy et venture building : une organisation conçue pour transformer les besoins métier en résultats concrets."
        kicker="Une chaîne de valeur complète, de la stratégie à l’exécution"
        theme="blue"
        metrics={[
          { value: "4", label: "pôles spécialisés" },
          { value: "1", label: "méthode unifiée d’exécution" },
          { value: "24h", label: "délai de première orientation" },
        ]}
        primaryAction={{ href: "/contact", label: "Discuter de votre besoin" }}
        secondaryAction={{ href: "/produits", label: "Voir nos produits" }}
      />
      <NoyaLandingPoles />
    </NoyaLandingPageChrome>
  );
}
