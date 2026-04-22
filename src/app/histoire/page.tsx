import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingStory } from "@/components/landing/sections/NoyaLandingStory";

export default function HistoirePage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingPageIntro
        eyebrow="Histoire"
        title={
          <>
            Notre trajectoire
            <br />
            <em>depuis 2021</em>
          </>
        }
        lead="De la prestation digitale à la construction d’un groupe structuré : découvrez les étapes, les choix et les convictions qui ont façonné Noya Industries."
        kicker="2021 → 2026 · De l’exécution terrain à la plateforme produit"
        theme="gold"
        metrics={[
          { value: "5", label: "années de construction" },
          { value: "100+", label: "missions livrées" },
          { value: "4", label: "pôles intégrés" },
        ]}
        primaryAction={{ href: "/contact", label: "Parler avec l’équipe" }}
        secondaryAction={{ href: "/poles", label: "Découvrir nos pôles" }}
      />
      <NoyaLandingStory />
    </NoyaLandingPageChrome>
  );
}
