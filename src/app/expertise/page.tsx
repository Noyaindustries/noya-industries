import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingBlog } from "@/components/landing/sections/NoyaLandingBlog";

export default function ExpertisePage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingPageIntro
        eyebrow="Expertise"
        title={
          <>
            Analyses terrain,
            <br />
            <em>retours d’expérience</em>
          </>
        }
        lead="Nos publications partagent les enseignements issus de nos missions, de nos déploiements produit et de nos accompagnements en entreprise."
        kicker="Insights pratiques, cas réels, méthodes applicables immédiatement"
        theme="green"
        metrics={[
          { value: "100+", label: "audits analysés" },
          { value: "3", label: "verticales d’expertise publiées" },
          { value: "1", label: "objectif : décision actionnable" },
        ]}
        primaryAction={{ href: "/contact", label: "Demander un diagnostic" }}
        secondaryAction={{ href: "/histoire", label: "Voir notre parcours" }}
      />
      <NoyaLandingBlog />
    </NoyaLandingPageChrome>
  );
}
