"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [successViaMailto, setSuccessViaMailto] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    setSuccessViaMailto(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      topic: String(fd.get("topic") ?? ""),
      message: String(fd.get("message") ?? ""),
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
        setStatus("err");
        setErrMsg(data.error ?? "Une erreur est survenue.");
        return;
      }
      if (data.redirect) {
        form.reset();
        setSuccessViaMailto(true);
        setStatus("ok");
        window.setTimeout(() => {
          window.location.assign(data.redirect!);
        }, 2400);
        return;
      }
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
      setErrMsg("Réseau indisponible. Réessayez plus tard.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-12 grid gap-6"
      id="contact-form"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-[family-name:var(--font-dm-mono)] mb-2 block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
            Nom complet
          </span>
          <input
            required
            name="name"
            autoComplete="name"
            className="w-full rounded-xl border border-noya-line bg-noya-surface/80 px-4 py-3.5 text-noya-text outline-none ring-noya-gold/30 transition placeholder:text-noya-faint focus:border-noya-gold/40 focus:ring-2"
            placeholder="Jane Doe"
          />
        </label>
        <label className="block">
          <span className="font-[family-name:var(--font-dm-mono)] mb-2 block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
            E-mail professionnel
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="w-full rounded-xl border border-noya-line bg-noya-surface/80 px-4 py-3.5 text-noya-text outline-none ring-noya-gold/30 transition placeholder:text-noya-faint focus:border-noya-gold/40 focus:ring-2"
            placeholder="vous@organisation.com"
          />
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-[family-name:var(--font-dm-mono)] mb-2 block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
            Organisation
          </span>
          <input
            name="company"
            autoComplete="organization"
            className="w-full rounded-xl border border-noya-line bg-noya-surface/80 px-4 py-3.5 text-noya-text outline-none ring-noya-gold/30 transition placeholder:text-noya-faint focus:border-noya-gold/40 focus:ring-2"
            placeholder="Entreprise ou institution"
          />
        </label>
        <label className="block">
          <span className="font-[family-name:var(--font-dm-mono)] mb-2 block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
            Téléphone
          </span>
          <input
            name="phone"
            autoComplete="tel"
            className="w-full rounded-xl border border-noya-line bg-noya-surface/80 px-4 py-3.5 text-noya-text outline-none ring-noya-gold/30 transition placeholder:text-noya-faint focus:border-noya-gold/40 focus:ring-2"
            placeholder="+33 …"
          />
        </label>
      </div>
      <label className="block">
        <span className="font-[family-name:var(--font-dm-mono)] mb-2 block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
          Sujet
        </span>
        <input
          name="topic"
          className="w-full rounded-xl border border-noya-line bg-noya-surface/80 px-4 py-3.5 text-noya-text outline-none ring-noya-gold/30 transition placeholder:text-noya-faint focus:border-noya-gold/40 focus:ring-2"
          placeholder="Stratégie, innovation, atelier…"
        />
      </label>
      <label className="block">
        <span className="font-[family-name:var(--font-dm-mono)] mb-2 block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
          Message
        </span>
        <textarea
          required
          name="message"
          rows={5}
          className="w-full resize-y rounded-xl border border-noya-line bg-noya-surface/80 px-4 py-3.5 text-noya-text outline-none ring-noya-gold/30 transition placeholder:text-noya-faint focus:border-noya-gold/40 focus:ring-2"
          placeholder="Décrivez votre contexte, vos enjeux et vos délais."
        />
      </label>
      {status === "ok" ? (
        <p className="text-sm text-noya-gold-soft" role="status">
          {successViaMailto ? (
            <>
              Merci — votre message est prêt. Votre messagerie s’ouvrira dans un instant sur
              services@noyaindustries.com ; finalisez l’envoi depuis votre boîte mail. Réponse sous 48h
              ouvrées à réception.
            </>
          ) : (
            <>Merci — votre message a bien été enregistré. Nous revenons vers vous sous 48h ouvrées.</>
          )}
        </p>
      ) : null}
      {status === "err" ? (
        <p className="text-sm text-red-300/90" role="alert">
          {errMsg}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-full bg-noya-gold py-4 text-sm font-semibold tracking-wide text-[#1a1208] transition hover:bg-noya-gold-soft disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-[220px]"
      >
        {status === "loading" ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
