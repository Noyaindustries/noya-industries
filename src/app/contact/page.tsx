import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { NoyaLandingPageIntro } from "@/components/landing/NoyaLandingPageIntro";
import { NoyaLandingContact } from "@/components/landing/sections/NoyaLandingContact";

export default function ContactPage() {
  return (
    <NoyaLandingPageChrome>
      <NoyaLandingContact />
      <NoyaLandingPageIntro
        eyebrow="Contact"
        title={
          <>
            Parlons de vos objectifs
            <br />
            <em>et du plan d’exécution</em>
          </>
        }
        lead="Partagez votre besoin et recevez un cadrage clair : périmètre, proposition d’approche, délais et prochaines étapes."
        kicker="Réponse orientée action, structurée et contextualisée"
        theme="silver"
        metrics={[
          { value: "<24h", label: "retour initial visé" },
          { value: "1", label: "interlocuteur de pilotage" },
          { value: "100%", label: "focus sur votre contexte métier" },
        ]}
        primaryAction={{ href: "#contact", label: "Envoyer un message" }}
        secondaryAction={{ href: "/poles", label: "Choisir un pôle" }}
      />
    </NoyaLandingPageChrome>
  );
}
