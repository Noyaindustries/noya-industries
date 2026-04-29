"use client";

import { useState } from "react";

import {
  playFieldFocus,
  playSoftError,
  playSuccess,
  resumeUiAudio,
} from "@/lib/ui-sounds";

type ContactFormMode = "contact" | "recruitment";

type NoyaLandingContactFormProps = {
  mode?: ContactFormMode;
};

export function NoyaLandingContactForm({
  mode = "contact",
}: NoyaLandingContactFormProps) {
  const isRecruitment = mode === "recruitment";
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const rawMessage = String(fd.get("message") ?? "").trim();

    if (name.length < 2) {
      playSoftError();
      setStatus("err");
      setErrMsg("Indiquez votre nom (2 caractères minimum).");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      playSoftError();
      setStatus("err");
      setErrMsg("Une adresse email valide est requise.");
      return;
    }
    if (rawMessage.length < 10) {
      playSoftError();
      setStatus("err");
      setErrMsg("Le message doit contenir au moins 10 caractères.");
      return;
    }

    setStatus("loading");
    setErrMsg("");

    const payload = {
      name,
      email,
      company: "",
      phone: "",
      ...(isRecruitment ? { topic: "Recrutement" as const } : {}),
      message: rawMessage,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };
      if (!res.ok) {
        playSoftError();
        setStatus("err");
        setErrMsg(data.error ?? "Une erreur est survenue.");
        return;
      }
      if (data.redirect) {
        playSuccess();
        window.location.assign(data.redirect);
        return;
      }
      playSuccess();
      setStatus("ok");
      form.reset();
    } catch {
      playSoftError();
      setStatus("err");
      setErrMsg("Réseau indisponible. Réessayez plus tard.");
    }
  }

  if (status === "ok") {
    return (
      <div className="nox-form-success form-success">
        <div className="nox-success-ring" aria-hidden="true" />
        <div className="form-success-badge nox-success-mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="form-success-title">
          {isRecruitment ? "Candidature envoyée" : "Message transmis"}
        </div>
        <p className="form-success-copy">
          {isRecruitment
            ? "Nous vous recontactons si votre profil correspond à nos besoins."
            : "Réponse sous 24h ouvrables par email ou WhatsApp."}
        </p>
        <button
          type="button"
          className="nox-btn-ghost form-success-reset"
          onClick={() => setStatus("idle")}
        >
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="nox-contact-form premium-contact-form"
      noValidate
      onFocusCapture={(e) => {
        const t = e.target as HTMLElement;
        if (t.matches("input, textarea")) {
          resumeUiAudio();
          playFieldFocus();
        }
      }}
    >
      <div className="fg">
        <label htmlFor="nox-name">
          Nom <em>*</em>
        </label>
        <input id="nox-name" type="text" name="name" placeholder="Prénom et nom" autoComplete="name" />
      </div>

      <div className="fg">
        <label htmlFor="nox-email">
          Email <em>*</em>
        </label>
        <input id="nox-email" type="email" name="email" placeholder="vous@email.com" autoComplete="email" />
      </div>

      <div className="fg">
        <label htmlFor="nox-message">
          Message <em>*</em>
        </label>
        <textarea
          id="nox-message"
          name="message"
          placeholder={
            isRecruitment
              ? "Poste visé, parcours, liens CV…"
              : "Objet de votre demande…"
          }
          minLength={10}
          maxLength={1500}
          rows={3}
        />
      </div>

      {errMsg ? (
        <p role="alert" className="form-error nox-form-error">
          {errMsg}
        </p>
      ) : null}

      <div className="nox-wizard-actions">
        <span className="nox-wizard-back-spacer" aria-hidden="true" />
        <button type="submit" className="btn-submit nox-btn-submit nox-wizard-submit" disabled={status === "loading"}>
          {status === "loading" ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}
