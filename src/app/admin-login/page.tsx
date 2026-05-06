"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextUrl = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    const queryValue = new URLSearchParams(window.location.search).get("next");
    return queryValue && queryValue.length > 0 ? queryValue : "/dashboard";
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Erreur réseau, réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="sec-full blog-bg admin-login-page">
      <div className="inner admin-login-inner">
        <section className="admin-login-hero">
          <p className="eyebrow">Accès sécurisé</p>
          <h1 className="display">Portail admin Noya</h1>
          <p className="lead">
            Espace réservé à l&apos;équipe interne. Les sessions sont protégées par cookie sécurisé.
          </p>
          <ul className="admin-login-points">
            <li>Gestion du blog, des membres et des contenus</li>
            <li>Protection d&apos;accès via middleware</li>
            <li>Déconnexion instantanée depuis le dashboard</li>
          </ul>
        </section>

        <form onSubmit={onSubmit} className="card admin-login-card">
          <div className="admin-login-card-top">
            <div className="admin-login-badge">Noya Industries</div>
            <p>Authentification administrateur</p>
          </div>
          <label className="blog-field blog-field-full">
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn-hero admin-login-submit" disabled={submitting}>
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
          {error ? <p className="blog-message blog-message-error">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
