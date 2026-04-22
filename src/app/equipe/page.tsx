import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingTeam } from "@/components/landing/sections/NoyaLandingTeam";

export default function EquipePage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingPageIntro
        eyebrow="Équipe"
        title={
          <>
            Les profils qui transforment
            <br />
            <em>la vision en exécution</em>
          </>
        }
        lead="Une équipe pluridisciplinaire engagée, entre stratégie, design et ingénierie, pour livrer vite et bien sur chaque mission."
        kicker="Direction produit, design et ingénierie réunis autour d’un standard commun"
        theme="cobalt"
        metrics={[
          { value: "3", label: "profils cœur présentés" },
          { value: "1", label: "vision partagée d’exécution" },
          { value: "360°", label: "couverture des besoins client" },
        ]}
        primaryAction={{ href: "/contact", label: "Travailler avec nous" }}
        secondaryAction={{ href: "/poles", label: "Voir nos expertises" }}
      />
      <NoyaLandingTeam />
    </NoyaLandingPageChrome>
  );
}
