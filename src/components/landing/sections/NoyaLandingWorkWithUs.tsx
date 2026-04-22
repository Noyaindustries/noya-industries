"use client";

import { useMemo, useState } from "react";

type WorkType = "partenaire" | "investisseur";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  partnerType: string;
  sector: string;
  partnerDescription: string;
  investorProfile: string;
  investorTicket: string;
  investorDescription: string;
  referral: string;
};

const DEFAULT_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  country: "Côte d'Ivoire",
  partnerType: "",
  sector: "",
  partnerDescription: "",
  investorProfile: "",
  investorTicket: "",
  investorDescription: "",
  referral: "",
};

const INTEREST_OPTIONS = [
  "Infinite Core (SaaS)",
  "NYImmobilier",
  "PRESENZ",
  "Noya Industries (groupe)",
] as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NoyaLandingWorkWithUs() {
  const [open, setOpen] = useState(false);
  const [workType, setWorkType] = useState<WorkType>("partenaire");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const title = workType === "partenaire" ? "Devenir partenaire" : "Rejoindre notre startup studio";
  const submitLabel = workType === "partenaire" ? "Envoyer ma demande" : "Envoyer ma demande";

  const requiredMissing = useMemo(() => {
    if (!form.firstName.trim()) return "Le prénom est requis.";
    if (!form.lastName.trim()) return "Le nom est requis.";
    if (!form.email.trim()) return "L'email est requis.";
    if (!emailRe.test(form.email.trim())) return "Adresse email invalide.";
    if (!form.company.trim()) return "L'entreprise / organisation est requise.";
    if (!form.country.trim()) return "Le pays est requis.";

    if (workType === "partenaire") {
      if (!form.partnerType.trim()) return "Le type de partenariat est requis.";
      if (!form.partnerDescription.trim()) return "Merci de décrire votre proposition de partenariat.";
      return "";
    }

    if (!form.investorProfile.trim()) return "Le profil investisseur est requis.";
    if (interests.length === 0) return "Sélectionnez au moins une entité d'intérêt.";
    if (!form.investorDescription.trim()) return "Merci de décrire votre approche d'investissement.";
    return "";
  }, [form, interests.length, workType]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((v) => v !== interest) : [...prev, interest],
    );
  };

  const openModal = (type: WorkType) => {
    setWorkType(type);
    setOpen(true);
    setDone(false);
    setError("");
    setSending(false);
  };

  const closeModal = () => {
    setOpen(false);
    setError("");
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setInterests([]);
    setDone(false);
    setError("");
    setSending(false);
  };

  const submit = async () => {
    if (requiredMissing) {
      setError(requiredMissing);
      return;
    }
    setError("");
    setSending(true);

    const payload = {
      workType,
      ...form,
      interests,
    };

    try {
      const response = await fetch("/api/partnership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error || "Envoi impossible pour le moment.");
      }

      setDone(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Envoi impossible pour le moment.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="sec-full rwu-section" id="travailler-avec-nous">
        <div className="inner">
          <div className="rwu-eyebrow">Rejoindre Noya Industries</div>
          <h2 className="rwu-title">
            Construisons ensemble
            <br />
            l&apos;<span>Afrique digitale.</span>
          </h2>
          <p className="rwu-sub">
            Vous êtes partenaire commercial, technologique ou institutionnel — ou vous souhaitez
            investir dans un écosystème digital en pleine croissance. Parlons-en.
          </p>

          <div className="rwu-actions">
            <button type="button" className="rwu-btn rwub-blue" onClick={() => openModal("partenaire")}>
              Devenir partenaire
            </button>
            <button
              type="button"
              className="rwu-btn rwub-gold"
              onClick={() => openModal("investisseur")}
            >
              Rejoindre notre startup studio
            </button>
          </div>

        </div>
      </section>

      <div
        className={`rwu-overlay${open ? " active" : ""}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="rwu-modal" role="dialog" aria-modal="true" aria-labelledby="rwu-modal-title">
          <div className="rwu-head">
            <div>
              <div className="rwu-head-eyebrow">Noya Industries</div>
              <div id="rwu-modal-title" className="rwu-head-title">
                {title}
              </div>
            </div>
            <button type="button" className="rwu-close" onClick={closeModal} aria-label="Fermer">
              ×
            </button>
          </div>

          <div className="rwu-tabs">
            <button
              type="button"
              className={`rwu-tab${workType === "partenaire" ? " active blue" : ""}`}
              onClick={() => setWorkType("partenaire")}
            >
              Partenaire
            </button>
            <button
              type="button"
              className={`rwu-tab${workType === "investisseur" ? " active gold" : ""}`}
              onClick={() => setWorkType("investisseur")}
            >
              Investisseur
            </button>
          </div>

          {!done ? (
            <div className="rwu-body">
              <div className="rwu-divider">Identite</div>

              <div className="rwu-row">
                <div className="rwu-field">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="Kouassi"
                  />
                </div>
                <div className="rwu-field">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Amani"
                  />
                </div>
              </div>

              <div className="rwu-row">
                <div className="rwu-field">
                  <label>Email professionnel *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="vous@email.ci"
                  />
                </div>
                <div className="rwu-field">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>
              </div>

              <div className="rwu-row">
                <div className="rwu-field">
                  <label>Entreprise / Organisation *</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="Nom de votre structure"
                  />
                </div>
                <div className="rwu-field">
                  <label>Pays *</label>
                  <select
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    aria-label="Pays"
                    title="Pays"
                  >
                    <option value="">Sélectionner</option>
                    <option>Côte d'Ivoire</option>
                    <option>Sénégal</option>
                    <option>Mali</option>
                    <option>Burkina Faso</option>
                    <option>Guinée</option>
                    <option>Cameroun</option>
                    <option>Ghana</option>
                    <option>Togo</option>
                    <option>Bénin</option>
                    <option>France</option>
                    <option>Belgique</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>

              {workType === "partenaire" ? (
                <>
                  <div className="rwu-divider">Votre proposition de partenariat</div>
                  <div className="rwu-field">
                    <label>Type de partenariat souhaité *</label>
                    <select
                      value={form.partnerType}
                      onChange={(e) => updateField("partnerType", e.target.value)}
                      aria-label="Type de partenariat souhaité"
                      title="Type de partenariat souhaité"
                    >
                      <option value="">Sélectionner</option>
                      <option>Revendeur / Agent Infinite Core</option>
                      <option>Partenaire commercial PRESENZ</option>
                      <option>Partenaire institutionnel</option>
                      <option>Partenaire technologique</option>
                      <option>Partenaire distribution ACS</option>
                      <option>Partenariat PADDE-CI</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="rwu-field">
                    <label>Secteur d&apos;activité</label>
                    <select
                      value={form.sector}
                      onChange={(e) => updateField("sector", e.target.value)}
                      aria-label="Secteur d'activité"
                      title="Secteur d'activité"
                    >
                      <option value="">Sélectionner</option>
                      <option>Commerce & Distribution</option>
                      <option>Services aux entreprises</option>
                      <option>Technologie & Digital</option>
                      <option>Finance & Banque</option>
                      <option>BTP & Immobilier</option>
                      <option>Santé</option>
                      <option>Éducation & Formation</option>
                      <option>Agriculture & Agroalimentaire</option>
                      <option>Logistique & Transport</option>
                      <option>Institution publique</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="rwu-field">
                    <label>Décrivez votre activité et ce que vous apporteriez *</label>
                    <textarea
                      rows={5}
                      value={form.partnerDescription}
                      onChange={(e) => updateField("partnerDescription", e.target.value)}
                      aria-label="Description du partenariat"
                      title="Description du partenariat"
                      placeholder="Présentez votre activité, votre réseau et la valeur ajoutée proposée."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="rwu-divider">Votre profil investisseur</div>
                  <div className="rwu-row">
                    <div className="rwu-field">
                      <label>Profil *</label>
                      <select
                        value={form.investorProfile}
                        onChange={(e) => updateField("investorProfile", e.target.value)}
                        aria-label="Profil investisseur"
                        title="Profil investisseur"
                      >
                        <option value="">Sélectionner</option>
                        <option>Business Angel</option>
                        <option>Fonds d&apos;investissement</option>
                        <option>Institution financière</option>
                        <option>Investisseur privé</option>
                        <option>Family Office</option>
                        <option>Fonds souverain</option>
                      </select>
                    </div>
                    <div className="rwu-field">
                      <label>Ticket envisagé</label>
                      <select
                        value={form.investorTicket}
                        onChange={(e) => updateField("investorTicket", e.target.value)}
                        aria-label="Ticket envisagé"
                        title="Ticket envisagé"
                      >
                        <option value="">Sélectionner</option>
                        <option>Moins de 5M FCFA</option>
                        <option>5M - 25M FCFA</option>
                        <option>25M - 100M FCFA</option>
                        <option>100M - 500M FCFA</option>
                        <option>Plus de 500M FCFA</option>
                        <option>A définir ensemble</option>
                      </select>
                    </div>
                  </div>
                  <div className="rwu-field">
                    <label>Entité(s) d&apos;intérêt *</label>
                    <div className="rwu-check-grid">
                      {INTEREST_OPTIONS.map((option) => {
                        const checked = interests.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            className={`rwu-check${checked ? " checked" : ""}`}
                            onClick={() => toggleInterest(option)}
                          >
                            <span className="rwu-box" />
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rwu-field">
                    <label>Votre approche et vos attentes *</label>
                    <textarea
                      rows={5}
                      value={form.investorDescription}
                      onChange={(e) => updateField("investorDescription", e.target.value)}
                      aria-label="Approche investisseur"
                      title="Approche investisseur"
                      placeholder="Décrivez vos critères d'investissement, votre horizon et vos attentes."
                    />
                  </div>
                </>
              )}

              <div className="rwu-divider">Informations complémentaires</div>
              <div className="rwu-field">
                <label>Comment avez-vous connu Noya Industries ?</label>
                <select
                  value={form.referral}
                  onChange={(e) => updateField("referral", e.target.value)}
                  aria-label="Origine du contact"
                  title="Origine du contact"
                >
                  <option value="">Sélectionner</option>
                  <option>Recommandation / Bouche-à-oreille</option>
                  <option>Réseaux sociaux</option>
                  <option>Site web Noya Industries</option>
                  <option>Événement / Salon professionnel</option>
                  <option>Presse / Média</option>
                  <option>Infinite Core</option>
                  <option>Recherche internet</option>
                </select>
              </div>

              {error ? <div className="rwu-error">{error}</div> : null}

              <button
                type="button"
                className={`rwu-submit${workType === "investisseur" ? " gold" : ""}`}
                onClick={submit}
                disabled={sending}
              >
                {sending ? "Envoi en cours..." : submitLabel}
              </button>
              <p className="rwu-note">
                Toutes les demandes sont traitées sous 48h · Données strictement confidentielles
                <br />
                services@noyaindustries.com · +225 07 77 22 51 85
              </p>
            </div>
          ) : (
            <div className="rwu-confirm">
              <div className="rwu-confirm-icon">✓</div>
              <div className="rwu-confirm-title">Demande envoyée !</div>
              <p className="rwu-confirm-copy">
                Merci pour votre intérêt pour Noya Industries.
                <br />
                L&apos;équipe vous recontactera dans les 48 heures ouvrées.
              </p>
              <button
                type="button"
                className="rwu-reset"
                onClick={() => {
                  resetForm();
                  closeModal();
                }}
              >
                Nouvelle demande
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
