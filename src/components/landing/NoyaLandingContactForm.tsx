"use client";

import { useMemo, useState } from "react";

export function NoyaLandingContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const messageLength = useMemo(() => messageDraft.trim().length, [messageDraft]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const first = String(fd.get("firstName") ?? "").trim();
    const last = String(fd.get("lastName") ?? "").trim();
    const name = [first, last].filter(Boolean).join(" ").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (name.length < 2) {
      setStatus("err");
      setErrMsg("Indiquez au moins le prénom et le nom (2 caractères minimum au total).");
      return;
    }
    if (message.length < 10) {
      setStatus("err");
      setErrMsg("Le message doit contenir au moins 10 caractères.");
      return;
    }
    setStatus("loading");
    setErrMsg("");
    const payload = {
      name,
      email: String(fd.get("email") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      topic: String(fd.get("topic") ?? "").trim(),
      message,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("err");
        setErrMsg(data.error ?? "Une erreur est survenue.");
        return;
      }
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
      setErrMsg("Réseau indisponible. Réessayez plus tard.");
    }
  }

  if (status === "ok") {
    return (
      <div className="form-success">
        <div className="form-success-badge">✓</div>
        <div className="form-success-title">Message envoyé !</div>
        <p className="form-success-copy">
          Notre équipe vous contacte sous 24h ouvrables
          <br />
          par email ou sur WhatsApp.
        </p>
        <button
          type="button"
          className="btn-outline form-success-reset"
          onClick={() => {
            setStatus("idle");
            setMessageDraft("");
          }}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="premium-contact-form">
      <div className="form-meta">
        <div className="form-chip">Réponse sous 24h</div>
        <div className="form-chip muted">Étape 1/1 - Brief initial</div>
      </div>
      <div className="fgr">
        <div className="fg">
          <label>
            Prénom <em>*</em>
          </label>
          <input type="text" name="firstName" placeholder="Kofi" required minLength={1} />
        </div>
        <div className="fg">
          <label>
            Nom <em>*</em>
          </label>
          <input type="text" name="lastName" placeholder="Asante" required minLength={1} />
        </div>
      </div>
      <div className="fg">
        <label>
          Email professionnel <em>*</em>
        </label>
        <input type="email" name="email" placeholder="vous@entreprise.ci" required autoComplete="email" />
      </div>
      <div className="fg">
        <label>Entreprise / Organisation</label>
        <input type="text" name="company" placeholder="Votre structure" autoComplete="organization" />
      </div>
      <div className="fgr">
        <div className="fg">
          <label>Téléphone / WhatsApp</label>
          <input type="tel" name="phone" placeholder="+225 07 00 00 00 00" autoComplete="tel" />
        </div>
        <div className="fg">
          <label>Budget indicatif</label>
          <select name="budget" defaultValue="" aria-label="Budget indicatif">
            <option value="">Non défini</option>
            <option>Moins de 500 000 FCFA</option>
            <option>500 000 à 2 000 000 FCFA</option>
            <option>2 000 000 à 10 000 000 FCFA</option>
            <option>Plus de 10 000 000 FCFA</option>
          </select>
        </div>
      </div>
      <div className="fg">
        <label>
          Pôle concerné <em>*</em>
        </label>
        <select name="topic" required defaultValue="" aria-label="Pôle concerné">
          <option value="" disabled>
            Sélectionner...
          </option>
          <optgroup label="Consulting (PADDE-CI)">
            <option>Audit Rapide — Diagnostic 48h</option>
            <option>Audit Business — Analyse complète</option>
            <option>Audit Institutionnel</option>
            <option>Marketing &amp; Community Management</option>
          </optgroup>
          <optgroup label="Tech">
            <option>Site web PRESENZ</option>
            <option>Infinite Core — Logiciel de gestion</option>
            <option>Infinite System — Enterprise</option>
            <option>Développement sur mesure</option>
          </optgroup>
          <optgroup label="Academy">
            <option>Programme de formation</option>
            <option>Coaching dirigeant</option>
          </optgroup>
          <optgroup label="Startup Studio">
            <option>Co-fondation de projet</option>
            <option>Partenariat stratégique</option>
          </optgroup>
          <option>Autre demande</option>
        </select>
      </div>
      <div className="fg">
        <label>
          Message <em>*</em>
        </label>
        <textarea
          name="message"
          placeholder="Décrivez votre besoin, votre contexte et vos objectifs..."
          required
          minLength={10}
          maxLength={1500}
          rows={5}
          value={messageDraft}
          onChange={(e) => setMessageDraft(e.target.value)}
        />
        <div className={`message-count ${messageLength < 10 ? "warn" : ""}`}>
          {messageLength}/1500 caractères
        </div>
      </div>
      {status === "err" ? (
        <p role="alert" className="form-error">
          {errMsg}
        </p>
      ) : null}
      <p className="form-legal">
        En soumettant ce formulaire, vous acceptez d&apos;être contacté(e) par notre équipe pour traiter votre demande.
      </p>
      <button type="submit" className="btn-submit" disabled={status === "loading"}>
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message →"}
      </button>
    </form>
  );
}
