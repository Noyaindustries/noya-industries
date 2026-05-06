"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostsManager() {
  const TOTAL_STEPS = 3;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPost>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof BlogPost, string>>>({});
  const localImageInputRef = useRef<HTMLInputElement | null>(null);

  const sortedPosts = useMemo(() => [...posts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [posts]);
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

  async function loadPosts() {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/blogs", { cache: "no-store" });
      const data = (await response.json()) as { posts?: BlogPost[]; error?: string };
      if (data.error) setMessage({ type: "error", text: data.error });
      setPosts(data.posts ?? []);
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant le chargement des articles." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

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
    return nextErrors;
  }

  function resetFormState() {
    setForm(EMPTY_FORM);
    setIsEditing(false);
    setErrors({});
    setCurrentStep(1);
    setFormOpen(false);
  }

  function canGoToNextStep(): boolean {
    if (currentStep === 1) {
      const slugToValidate = isEditing ? form.slug : normalizeSlug(form.slug || form.title);
      return Boolean(form.title.trim() && slugToValidate && form.category.trim());
    }
    if (currentStep === 2) {
      return Boolean(form.excerpt.trim() && form.dateLabel.trim() && form.readTime.trim());
    }
    return true;
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        slug: isEditing ? form.slug : normalizeSlug(form.slug || form.title),
        content: form.content.map((line) => line.trim()).filter(Boolean),
      };
      const response = await fetch("/api/dashboard/blogs", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Erreur pendant l'enregistrement." });
        return;
      }
      setForm(EMPTY_FORM);
      setIsEditing(false);
      setErrors({});
      setCurrentStep(1);
      setFormOpen(false);
      await loadPosts();
      setMessage({ type: "success", text: isEditing ? "Article mis à jour." : "Article créé." });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant l'enregistrement." });
    } finally {
      setSubmitting(false);
    }
  }

  async function deletePost(slug: string) {
    const response = await fetch(`/api/dashboard/blogs?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage({ type: "error", text: data.error ?? "Suppression impossible." });
      return;
    }
    await loadPosts();
    setMessage({ type: "success", text: "Article supprimé." });
  }

  async function uploadImageFromLocal(file: File) {
    setUploadingImage(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/dashboard/blogs/upload", { method: "POST", body: formData });
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
      if (localImageInputRef.current) localImageInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className="card blog-create-card">
        <div className="blog-create-head">
          <div>
            <h3>Ajouter un article</h3>
            <p>Ouvre le formulaire de création ou de modification d&apos;article.</p>
          </div>
          <div className="blog-more">
            <button
              type="button"
              className="btn-hero"
              onClick={() => {
                setForm(EMPTY_FORM);
                setIsEditing(false);
                setErrors({});
                setCurrentStep(1);
                setFormOpen((previous) => !previous);
              }}
            >
              {formOpen ? "Fermer le formulaire" : "Ajouter un article"}
            </button>
          </div>
        </div>
      </div>

      {formOpen ? (
        <div
          className="team-form-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setFormOpen(false);
            }
          }}
        >
          <form onSubmit={submitForm} className="card blog-form-card team-form-floating-card" noValidate onClick={(event) => event.stopPropagation()}>
            <div className="team-form-floating-head">
              <h3>{isEditing ? "Modifier l'article" : "Ajouter un article"}</h3>
              <button type="button" className="ca-btn" onClick={() => setFormOpen(false)}>
                Fermer
              </button>
            </div>
            <div className="team-form-stepper" aria-label="Progression du formulaire">
              <span className={currentStep >= 1 ? "active" : ""}>1. Infos</span>
              <span className={currentStep >= 2 ? "active" : ""}>2. Meta</span>
              <span className={currentStep >= 3 ? "active" : ""}>3. Contenu</span>
            </div>

            {currentStep === 1 ? (
              <section className="blog-form-section">
                <div className="blog-form-grid">
                  <label className="blog-field"><span>Titre *</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
                  <label className="blog-field"><span>Slug {isEditing ? "(verrouillé)" : "(optionnel)"}</span><input value={form.slug} disabled={isEditing} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><small>URL finale: /blog/{previewSlug}</small></label>
                  <label className="blog-field"><span>Catégorie *</span><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
                  <label className="blog-field"><span>Ordre</span><input type="number" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></label>
                </div>
              </section>
            ) : null}

            {currentStep === 2 ? (
              <section className="blog-form-section">
                <div className="blog-form-grid">
                  <label className="blog-field"><span>Date affichée *</span><input value={form.dateLabel} onChange={(e) => setForm({ ...form, dateLabel: e.target.value })} /></label>
                  <label className="blog-field"><span>Temps de lecture *</span><input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} /></label>
                </div>
                <label className="blog-toggle"><input type="checkbox" checked={form.featured === true} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /><span>Article mis en avant</span></label>
                <label className="blog-field blog-field-full"><span>URL image</span><input value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... ou /uploads/..." /><div className="blog-more"><button type="button" className="btn-hero-out" disabled={uploadingImage} onClick={() => localImageInputRef.current?.click()}>{uploadingImage ? "Upload en cours..." : "Ajouter depuis mon ordinateur"}</button></div><input ref={localImageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="blog-local-image-input" onChange={(event) => { const selectedFile = event.target.files?.[0]; if (!selectedFile) return; void uploadImageFromLocal(selectedFile); }} /></label>
                <div className="blog-image-preview" aria-live="polite">{imagePreviewUrl ? <img className="blog-image-preview-media" src={imagePreviewUrl} alt="Aperçu visuel de l'article" /> : <div className="blog-image-fallback">Aperçu image</div>}</div>
              </section>
            ) : null}

            {currentStep === 3 ? (
              <section className="blog-form-section">
                <label className="blog-field blog-field-full"><span>Extrait *</span><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></label>
                <label className="blog-field blog-field-full"><span>Contenu *</span><textarea className="blog-content-area" value={form.content.join("\n")} onChange={(e) => setForm({ ...form, content: e.target.value.split("\n") })} /></label>
              </section>
            ) : null}

            <div className="blog-more blog-form-actions">
              {currentStep > 1 ? (
                <button type="button" className="btn-hero-out blog-form-secondary" onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}>
                  Étape précédente
                </button>
              ) : null}

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  className="btn-hero blog-form-primary"
                  disabled={!canGoToNextStep() || uploadingImage}
                  onClick={() => setCurrentStep((step) => Math.min(TOTAL_STEPS, step + 1))}
                >
                  Étape suivante
                </button>
              ) : (
                <button type="submit" className="btn-hero blog-form-primary" disabled={submitting || uploadingImage}>{submitting ? "Publication..." : isEditing ? "Enregistrer les modifications" : "Publier l'article"}</button>
              )}
              <button type="button" className="btn-hero-out blog-form-secondary" onClick={resetFormState}>Annuler</button>
            </div>
          </form>
        </div>
      ) : null}

      {message ? <p className={`lead blog-message ${message.type === "error" ? "blog-message-error" : "blog-message-success"}`}>{message.text}</p> : null}

      <div className="card blog-posts-card">
        <div className="blog-list-head">
          <h3>Liste des articles</h3>
        </div>
        {loading ? <p>Chargement…</p> : sortedPosts.map((post) => (
          <div key={post.slug} className="blog-post-item">
            <strong>{post.title}</strong> ({post.category}) {post.featured ? "· vedette" : ""}
            <div className="blog-post-actions">
              <button type="button" className="ca-btn" onClick={() => { setForm({ ...post, content: post.content.length > 0 ? post.content : [""] }); setIsEditing(true); setCurrentStep(1); setFormOpen(true); }}>Modifier</button>
              <button type="button" className="ca-btn" onClick={() => void deletePost(post.slug)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

