"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordVisibilityButton } from "@/components/PasswordVisibilityButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const nextUrl = useMemo(() => {
    if (typeof window === "undefined") return "/dashboard";
    const queryValue = new URLSearchParams(window.location.search).get("next");
    if (!queryValue || queryValue.startsWith("//")) return "/dashboard";
    try {
      const destination = new URL(queryValue, window.location.origin);
      if (
        destination.origin !== window.location.origin ||
        !destination.pathname.startsWith("/dashboard")
      ) {
        return "/dashboard";
      }
      return `${destination.pathname}${destination.search}${destination.hash}`;
    } catch {
      return "/dashboard";
    }
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        error?: string;
        passwordRotationRequired?: boolean;
      };
      if (!response.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }
      if (data.passwordRotationRequired) {
        try {
          sessionStorage.setItem("noya_password_rotation_required", "1");
        } catch {
          // ignore
        }
      }
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Erreur réseau, réessaie.");
    } finally {
      submittingRef.current = false;
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
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="services@noyaindustries.com"
              autoComplete="username"
              required
            />
          </label>
          <label className="blog-field blog-field-full">
            <span>Mot de passe</span>
            <span className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <PasswordVisibilityButton
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
              />
            </span>
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
