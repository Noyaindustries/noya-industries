"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";

type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  dateLabel: string;
  readTime: string;
  featured?: boolean;
  content: string[];
  order?: number;
};

const EMPTY_FORM: BlogPost = {
  slug: "",
  category: "Consulting",
  title: "",
  excerpt: "",
  imageUrl: "",
  dateLabel: "",
  readTime: "",
  featured: false,
  content: [""],
  order: 0,
};

export default function DashboardBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPost>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof BlogPost, string>>>({});
  const localImageInputRef = useRef<HTMLInputElement | null>(null);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [posts],
  );
  const previewSlug = useMemo(
    () => (isEditing ? form.slug : normalizeSlug(form.slug || form.title)) || "apercu-slug",
    [form.slug, form.title, isEditing],
  );
  const imagePreviewUrl = useMemo(() => {
    const candidate = form.imageUrl?.trim();
    if (!candidate) return null;
    if (candidate.startsWith("/")) return candidate;
    try {
      const parsed = new URL(candidate);
      if (!["http:", "https:"].includes(parsed.protocol)) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }, [form.imageUrl]);
  const submitLabel = isEditing ? "Enregistrer les modifications" : "Publier l'article";

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/blogs", { cache: "no-store" });
      // #region agent log
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
        body: JSON.stringify({
          sessionId: "efec23",
          runId: "pre-fix",
          hypothesisId: "H4",
          location: "src/app/dashboard/blog/page.tsx:68",
          message: "API blogs response status",
          data: { ok: res.ok, status: res.status },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const data = (await res.json()) as { posts?: BlogPost[]; error?: string };
      if (data.error) setMessage({ type: "error", text: data.error });
      setPosts(data.posts ?? []);
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant le chargement des articles." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
      body: JSON.stringify({
        sessionId: "efec23",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "src/app/dashboard/blog/page.tsx:92",
        message: "Dashboard blog mounted",
        data: { pathname: window.location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // #region agent log
    fetch("/sw.js", { method: "HEAD", cache: "no-store" })
      .then((resp) => {
        fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
          body: JSON.stringify({
            sessionId: "efec23",
            runId: "pre-fix",
            hypothesisId: "H2",
            location: "src/app/dashboard/blog/page.tsx:108",
            message: "sw.js HEAD probe result",
            data: { ok: resp.ok, status: resp.status },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      })
      .catch(() => {
        fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
          body: JSON.stringify({
            sessionId: "efec23",
            runId: "pre-fix",
            hypothesisId: "H2",
            location: "src/app/dashboard/blog/page.tsx:125",
            message: "sw.js HEAD probe failed",
            data: {},
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      });
    // #endregion

    // #region agent log
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
        body: JSON.stringify({
          sessionId: "efec23",
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "src/app/dashboard/blog/page.tsx:144",
          message: "Service worker registrations",
          data: {
            count: registrations.length,
            scopes: registrations.map((registration) => registration.scope),
            controllerUrl: navigator.serviceWorker.controller?.scriptURL ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    });
    // #endregion

    // #region agent log
    queueMicrotask(() => {
      const formEl = document.querySelector(".blog-form-card") as HTMLElement | null;
      const innerEl = document.querySelector(".blog-admin-inner") as HTMLElement | null;
      const secEl = document.querySelector(".blog-admin-page") as HTMLElement | null;
      const mainEl = document.querySelector(".main") as HTMLElement | null;
      const dashboardRootEl = document.querySelector(".dashboard-root") as HTMLElement | null;
      const payload = {
        viewportHeight: window.innerHeight,
        docClientHeight: document.documentElement.clientHeight,
        docScrollHeight: document.documentElement.scrollHeight,
        bodyScrollHeight: document.body.scrollHeight,
        htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
        bodyOverflowY: getComputedStyle(document.body).overflowY,
        formHeight: formEl?.getBoundingClientRect().height ?? null,
        formTop: formEl?.getBoundingClientRect().top ?? null,
        formBottom: formEl?.getBoundingClientRect().bottom ?? null,
        sectionOverflowY: secEl ? getComputedStyle(secEl).overflowY : null,
        innerOverflowY: innerEl ? getComputedStyle(innerEl).overflowY : null,
        mainOverflowY: mainEl ? getComputedStyle(mainEl).overflowY : null,
        dashboardRootOverflowY: dashboardRootEl ? getComputedStyle(dashboardRootEl).overflowY : null,
      };
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
        body: JSON.stringify({
          sessionId: "efec23",
          runId: "pre-fix",
          hypothesisId: "H6_H7",
          location: "src/app/dashboard/blog/page.tsx:170",
          message: "Layout and overflow snapshot",
          data: payload,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    });
    // #endregion

    queueMicrotask(() => {
      void loadPosts();
    });
  }, []);

  function normalizeSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function validateForm(): Partial<Record<keyof BlogPost, string>> {
    const nextErrors: Partial<Record<keyof BlogPost, string>> = {};
    const content = form.content.map((line) => line.trim()).filter(Boolean);
    const slugToValidate = isEditing ? form.slug : normalizeSlug(form.slug || form.title);
    if (!form.title.trim()) nextErrors.title = "Le titre est requis.";
    if (!slugToValidate) nextErrors.slug = "Le slug est requis (ou généré depuis le titre).";
    if (!form.category.trim()) nextErrors.category = "La catégorie est requise.";
    if (!form.excerpt.trim()) nextErrors.excerpt = "L'extrait est requis.";
    if (!form.dateLabel.trim()) nextErrors.dateLabel = "La date est requise.";
    if (!form.readTime.trim()) nextErrors.readTime = "Le temps de lecture est requis.";
    if (content.length === 0) nextErrors.content = "Ajoutez au moins un paragraphe.";
    if (form.imageUrl && form.imageUrl.trim()) {
      try {
        const url = new URL(form.imageUrl.trim());
        if (!["http:", "https:"].includes(url.protocol)) nextErrors.imageUrl = "URL image invalide.";
      } catch {
        nextErrors.imageUrl = "URL image invalide.";
      }
    }
    return nextErrors;
  }

  async function submitForm(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const validationErrors = validateForm();
    setErrors(validationErrors);
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
      body: JSON.stringify({
        sessionId: "efec23",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "src/app/dashboard/blog/page.tsx:122",
        message: "Submit validation result",
        data: { hasErrors: Object.keys(validationErrors).length > 0, isEditing },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        slug: isEditing ? form.slug : normalizeSlug(form.slug || form.title),
        content: form.content.map((line) => line.trim()).filter(Boolean),
      };
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/dashboard/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // #region agent log
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
        body: JSON.stringify({
          sessionId: "efec23",
          runId: "pre-fix",
          hypothesisId: "H2_H3_H4",
          location: "src/app/dashboard/blog/page.tsx:151",
          message: "Submit API response",
          data: { method, ok: res.ok, status: res.status },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Erreur pendant l'enregistrement." });
        return;
      }
      setForm(EMPTY_FORM);
      setIsEditing(false);
      setErrors({});
      await loadPosts();
      setMessage({ type: "success", text: isEditing ? "Article mis à jour." : "Article créé." });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant l'enregistrement." });
    } finally {
      setSubmitting(false);
    }
  }

  async function deletePost(slug: string) {
    setMessage(null);
    const res = await fetch(`/api/dashboard/blogs?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
      body: JSON.stringify({
        sessionId: "efec23",
        runId: "pre-fix",
        hypothesisId: "H5",
        location: "src/app/dashboard/blog/page.tsx:188",
        message: "Delete API response",
        data: { slug, ok: res.ok, status: res.status },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Suppression impossible." });
      return;
    }
    await loadPosts();
    setMessage({ type: "success", text: "Article supprimé." });
  }

  async function uploadImageFromLocal(file: File) {
    setUploadingImage(true);
    setMessage(null);

    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
      body: JSON.stringify({
        sessionId: "efec23",
        runId: "pre-fix",
        hypothesisId: "H11",
        location: "src/app/dashboard/blog/page.tsx:349",
        message: "Local image selected",
        data: { name: file.name, size: file.size, type: file.type },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/dashboard/blogs/upload", {
        method: "POST",
        body: formData,
      });

      // #region agent log
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
        body: JSON.stringify({
          sessionId: "efec23",
          runId: "pre-fix",
          hypothesisId: "H12",
          location: "src/app/dashboard/blog/page.tsx:372",
          message: "Local image upload response",
          data: { ok: response.ok, status: response.status },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      const data = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !data.url) {
        setMessage({ type: "error", text: data.error ?? "Upload image impossible." });
        return;
      }

      setForm((previous) => ({ ...previous, imageUrl: data.url }));
      setMessage({ type: "success", text: "Image locale ajoutée avec succès." });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant l'upload de l'image." });
    } finally {
      setUploadingImage(false);
      if (localImageInputRef.current) {
        localImageInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="sec-full blog-bg blog-admin-page">
      <div className="inner blog-admin-inner">
        <div className="blog-more blog-admin-toplinks">
          <Link className="btn-hero-out" href="/dashboard">
            Retour dashboard
          </Link>
          <Link className="btn-hero" href="/">
            Voir homepage
          </Link>
        </div>
        <h1 className="display">Gestion des articles blog</h1>
        <p className="lead">Les contenus créés ici alimentent la homepage et les pages blog.</p>

        <form onSubmit={submitForm} className="card blog-form-card" noValidate>
          <div className="blog-form-head">
            <div>
              <h2>{isEditing ? "Modifier l'article" : "Nouvel article"}</h2>
              <p>Un formulaire pro, lisible et structuré pour accélérer la publication.</p>
            </div>
            <span className="blog-form-mode">{isEditing ? "Mode édition" : "Mode création"}</span>
          </div>

          <section className="blog-form-section">
            <div className="blog-form-section-head">
              <h3>Infos principales</h3>
              <p>Titre, slug et catégorisation.</p>
            </div>
            <div className="blog-form-grid">
              <label className="blog-field">
                <span>Titre *</span>
                <input
                  placeholder="Ex: Construire une machine à croissance rentable"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                />
                {errors.title ? <small className="blog-field-error">{errors.title}</small> : null}
              </label>

              <label className="blog-field">
                <span>Slug {isEditing ? "(verrouillé)" : "(optionnel)"}</span>
                <input
                  placeholder="auto-généré depuis le titre"
                  value={form.slug}
                  onChange={(e) => {
                    setForm({ ...form, slug: e.target.value });
                    setErrors((prev) => ({ ...prev, slug: undefined }));
                  }}
                  disabled={isEditing}
                />
                <small>
                  URL finale: <strong>/blog/{previewSlug}</strong>
                </small>
                {errors.slug ? <small className="blog-field-error">{errors.slug}</small> : null}
              </label>

              <label className="blog-field">
                <span>Catégorie *</span>
                <input
                  placeholder="Ex: Consulting"
                  value={form.category}
                  onChange={(e) => {
                    setForm({ ...form, category: e.target.value });
                    setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                />
                {errors.category ? <small className="blog-field-error">{errors.category}</small> : null}
              </label>

              <label className="blog-field">
                <span>Ordre d&apos;affichage</span>
                <input
                  placeholder="0, 1, 2..."
                  type="number"
                  value={form.order ?? 0}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
                <small>Plus petit chiffre = plus haut dans la liste.</small>
              </label>
            </div>
          </section>

          <section className="blog-form-section">
            <div className="blog-form-section-head">
              <h3>Publication</h3>
              <p>Dates, lecture et mise en avant.</p>
            </div>
            <div className="blog-form-grid">
              <label className="blog-field">
                <span>Date affichée *</span>
                <input
                  placeholder="Ex: Mai 2026"
                  value={form.dateLabel}
                  onChange={(e) => {
                    setForm({ ...form, dateLabel: e.target.value });
                    setErrors((prev) => ({ ...prev, dateLabel: undefined }));
                  }}
                />
                {errors.dateLabel ? <small className="blog-field-error">{errors.dateLabel}</small> : null}
              </label>

              <label className="blog-field">
                <span>Temps de lecture *</span>
                <input
                  placeholder="Ex: 6 min"
                  value={form.readTime}
                  onChange={(e) => {
                    setForm({ ...form, readTime: e.target.value });
                    setErrors((prev) => ({ ...prev, readTime: undefined }));
                  }}
                />
                {errors.readTime ? <small className="blog-field-error">{errors.readTime}</small> : null}
              </label>
            </div>
            <label className="blog-toggle">
              <input
                type="checkbox"
                checked={form.featured === true}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span>Marquer comme article mis en avant</span>
            </label>
          </section>

          <section className="blog-form-section">
            <div className="blog-form-section-head">
              <h3>Média</h3>
              <p>Visuel de couverture avec aperçu en direct.</p>
            </div>
            <div className="blog-form-grid">
              <label className="blog-field blog-field-full">
                <span>URL image</span>
                <input
                  placeholder="https://..."
                  value={form.imageUrl ?? ""}
                  onChange={(e) => {
                    setForm({ ...form, imageUrl: e.target.value });
                    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                  }}
                />
                <small>Tu peux coller une URL ou téléverser une image locale (jpg, png, webp, gif).</small>
                <div className="blog-more">
                  <button
                    type="button"
                    className="btn-hero-out"
                    disabled={uploadingImage}
                    onClick={() => localImageInputRef.current?.click()}
                  >
                    {uploadingImage ? "Upload en cours..." : "Ajouter depuis mon ordinateur"}
                  </button>
                </div>
                <input
                  ref={localImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="blog-local-image-input"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0];
                    if (!selectedFile) return;
                    void uploadImageFromLocal(selectedFile);
                  }}
                />
                {errors.imageUrl ? <small className="blog-field-error">{errors.imageUrl}</small> : null}
              </label>
            </div>
            <div className="blog-image-preview" aria-live="polite">
              {imagePreviewUrl ? (
                <div
                  className="blog-image-preview-media"
                  role="img"
                  aria-label="Aperçu visuel de l'article"
                  style={{ backgroundImage: `url("${imagePreviewUrl}")` }}
                />
              ) : (
                <div className="blog-image-fallback">Aperçu image</div>
              )}
            </div>
          </section>

          <section className="blog-form-section">
            <div className="blog-form-section-head">
              <h3>Contenu</h3>
              <p>Résumé et corps de l&apos;article.</p>
            </div>
            <label className="blog-field blog-field-full">
              <span>Extrait *</span>
              <textarea
                placeholder="Résumé court affiché sur la liste des articles"
                value={form.excerpt}
                onChange={(e) => {
                  setForm({ ...form, excerpt: e.target.value });
                  setErrors((prev) => ({ ...prev, excerpt: undefined }));
                }}
              />
              {errors.excerpt ? <small className="blog-field-error">{errors.excerpt}</small> : null}
            </label>

            <label className="blog-field blog-field-full">
              <span>Contenu *</span>
              <textarea
                placeholder="Un paragraphe par ligne"
                className="blog-content-area"
                value={form.content.join("\n")}
                onChange={(e) => {
                  setForm({ ...form, content: e.target.value.split("\n") });
                  setErrors((prev) => ({ ...prev, content: undefined }));
                }}
              />
              <small>Astuce: chaque ligne non vide devient un paragraphe.</small>
              {errors.content ? <small className="blog-field-error">{errors.content}</small> : null}
            </label>
          </section>

          <div className="blog-form-actions-wrap">
            <div className="blog-more blog-form-actions">
              <button type="submit" className="btn-hero blog-form-primary" disabled={submitting || uploadingImage}>
                {submitting ? "Publication en cours..." : uploadingImage ? "Upload image..." : submitLabel}
              </button>
              <button
                type="button"
                className="btn-hero-out blog-form-secondary"
                disabled={submitting}
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setIsEditing(false);
                  setErrors({});
                }}
              >
                {isEditing ? "Annuler les modifications" : "Réinitialiser le formulaire"}
              </button>
            </div>
            <p className="blog-form-action-hint" aria-live="polite">
              {submitting
                ? "Enregistrement en cours, veuillez patienter..."
                : isEditing
                  ? "Les modifications seront appliquées immédiatement après validation."
                  : "Votre article sera ajouté à la liste après validation."}
            </p>
          </div>
        </form>

        {message ? (
          <p className={`lead blog-message ${message.type === "error" ? "blog-message-error" : "blog-message-success"}`}>
            {message.text}
          </p>
        ) : null}
        <div className="card blog-posts-card">
          {loading ? (
            <p>Chargement…</p>
          ) : (
            sortedPosts.map((post) => (
              <div key={post.slug} className="blog-post-item">
                <strong>{post.title}</strong> ({post.category}) {post.featured ? "· vedette" : ""}
                {post.imageUrl ? (
                  <div className="blog-post-thumb-wrap">
                    <div
                      role="img"
                      aria-label={post.title}
                      className="blog-post-thumb"
                      style={{ backgroundImage: `linear-gradient(135deg, rgba(245,166,35,.2), rgba(36,96,167,.2)), url("${post.imageUrl}")` }}
                    />
                  </div>
                ) : null}
                <div className="blog-post-actions">
                  <button
                    type="button"
                    className="ca-btn"
                    onClick={() => {
                      setForm({
                        ...post,
                        content: post.content.length > 0 ? post.content : [""],
                      });
                      setIsEditing(true);
                    }}
                  >
                    Modifier
                  </button>
                  <button type="button" className="ca-btn" onClick={() => void deletePost(post.slug)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
