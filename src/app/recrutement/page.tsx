import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingWorkWithUs } from "@/components/landing/sections/NoyaLandingWorkWithUs";

export default function RecrutementPage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingWorkWithUs />
      <NoyaLandingPageIntro
        eyebrow="Travailler avec nous"
        title={
          <>
            Devenez partenaire
            <br />
            <em>ou investisseur Noya</em>
          </>
        }
        lead="Nous accompagnons des alliances stratégiques, commerciales et financières pour accélérer des projets digitaux concrets en Afrique."
        kicker="Processus clair, réponse rapide et suivi personnalisé"
        theme="blue"
        metrics={[
          { value: "48h", label: "délai de retour visé" },
          { value: "2", label: "parcours : partenaire ou investisseur" },
          { value: "100%", label: "demandes traitées de façon confidentielle" },
        ]}
        primaryAction={{ href: "#travailler-avec-nous", label: "Lancer une demande" }}
        secondaryAction={{ href: "/contact", label: "Contacter l'équipe" }}
      />
    </NoyaLandingPageChrome>
  );
}
