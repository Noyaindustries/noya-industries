"use client";

import type { TeamSocialKind, TeamTone } from "@/lib/team-members";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type TeamMember = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  tone: TeamTone;
  desc: string;
  skills: string[];
  imageUrl: string | null;
  socials: Record<TeamSocialKind, string | null>;
  order: number;
};

const EMPTY_FORM: TeamMember = {
  slug: "",
  initials: "",
  name: "",
  role: "",
  tone: "blue",
  desc: "",
  skills: [],
  imageUrl: "",
  socials: { linkedin: "", facebook: "", instagram: "", tiktok: "", x: "" },
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

export default function DashboardTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamMember>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const localImageInputRef = useRef<HTMLInputElement | null>(null);

  const previewSlug = useMemo(
    () => (isEditing ? form.slug : normalizeSlug(form.slug || form.name)) || "apercu-slug",
    [form.slug, form.name, isEditing],
  );

  async function loadMembers() {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/team", { cache: "no-store" });
      const data = (await response.json()) as { members?: TeamMember[]; error?: string };
      if (data.error) setMessage({ type: "error", text: data.error });
      setMembers(data.members ?? []);
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant le chargement de l'équipe." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, []);

  async function uploadImageFromLocal(file: File) {
    setUploadingImage(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/dashboard/blogs/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string; url?: string };
      // #region agent log
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "efec23" },
        body: JSON.stringify({
          sessionId: "efec23",
          runId: "pre-fix",
          hypothesisId: "T1_T2_T3",
          location: "src/app/dashboard/team/page.tsx:87",
          message: "Team image upload payload",
          data: { ok: response.ok, hasUrl: typeof data.url === "string", urlType: typeof data.url },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!response.ok || !data.url) {
        setMessage({ type: "error", text: data.error ?? "Upload image impossible." });
        return;
      }
      setForm((previous) => ({ ...previous, imageUrl: data.url ?? null }));
      setMessage({ type: "success", text: "Image locale ajoutée avec succès." });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant l'upload de l'image." });
    } finally {
      setUploadingImage(false);
      if (localImageInputRef.current) localImageInputRef.current.value = "";
    }
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const payload: TeamMember = {
      ...form,
      slug: isEditing ? form.slug : normalizeSlug(form.slug || form.name),
      initials: form.initials.trim().toUpperCase().slice(0, 3),
      name: form.name.trim(),
      role: form.role.trim(),
      desc: form.desc.trim(),
      skills: form.skills.map((skill) => skill.trim()).filter(Boolean),
      socials: {
        linkedin: form.socials.linkedin?.trim() || null,
        facebook: form.socials.facebook?.trim() || null,
        instagram: form.socials.instagram?.trim() || null,
        tiktok: form.socials.tiktok?.trim() || null,
        x: form.socials.x?.trim() || null,
      },
      imageUrl: form.imageUrl?.trim() || null,
      order: form.order ?? 0,
    };

    if (!payload.slug || !payload.name || !payload.role || !payload.desc || !payload.initials || payload.skills.length === 0) {
      setMessage({ type: "error", text: "Complète les champs requis (nom, rôle, initials, bio, compétences)." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/dashboard/team", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Erreur pendant l'enregistrement du membre." });
        return;
      }
      setForm(EMPTY_FORM);
      setIsEditing(false);
      await loadMembers();
      setMessage({ type: "success", text: isEditing ? "Membre mis à jour." : "Membre ajouté." });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau pendant l'enregistrement du membre." });
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteMember(slug: string) {
    const response = await fetch(`/api/dashboard/team?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage({ type: "error", text: data.error ?? "Suppression impossible." });
      return;
    }
    await loadMembers();
    setMessage({ type: "success", text: "Membre supprimé." });
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
        <h1 className="display">Gestion de l&apos;équipe</h1>
        <p className="lead">Les profils ajoutés ici alimentent la section Équipe de la page d&apos;accueil.</p>

        <form onSubmit={submitForm} className="card blog-form-card" noValidate>
          <section className="blog-form-section">
            <div className="blog-form-grid">
              <label className="blog-field">
                <span>Nom *</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="blog-field">
                <span>Initiales *</span>
                <input value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} />
              </label>
              <label className="blog-field">
                <span>Rôle *</span>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </label>
              <label className="blog-field">
                <span>Ordre</span>
                <input type="number" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </label>
              <label className="blog-field">
                <span>Slug {isEditing ? "(verrouillé)" : "(optionnel)"}</span>
                <input value={form.slug} disabled={isEditing} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                <small>URL interne: {previewSlug}</small>
              </label>
              <label className="blog-field">
                <span>Ton visuel</span>
                <select
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value as TeamTone })}
                  className="blog-team-select"
                >
                  <option value="gold">Or</option>
                  <option value="blue">Bleu</option>
                  <option value="green">Vert</option>
                </select>
              </label>
              <label className="blog-field blog-field-full">
                <span>Bio *</span>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              </label>
              <label className="blog-field blog-field-full">
                <span>Compétences * (une par ligne)</span>
                <textarea value={form.skills.join("\n")} onChange={(e) => setForm({ ...form, skills: e.target.value.split("\n") })} />
              </label>
              <label className="blog-field blog-field-full">
                <span>URL image</span>
                <input value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... ou /uploads/..." />
                <div className="blog-more">
                  <button type="button" className="btn-hero-out" disabled={uploadingImage} onClick={() => localImageInputRef.current?.click()}>
                    {uploadingImage ? "Upload..." : "Ajouter depuis mon ordinateur"}
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
              </label>
            </div>
          </section>

          <section className="blog-form-section">
            <div className="blog-form-grid">
              <label className="blog-field">
                <span>LinkedIn</span>
                <input value={form.socials.linkedin ?? ""} onChange={(e) => setForm({ ...form, socials: { ...form.socials, linkedin: e.target.value } })} />
              </label>
              <label className="blog-field">
                <span>Facebook</span>
                <input value={form.socials.facebook ?? ""} onChange={(e) => setForm({ ...form, socials: { ...form.socials, facebook: e.target.value } })} />
              </label>
              <label className="blog-field">
                <span>Instagram</span>
                <input value={form.socials.instagram ?? ""} onChange={(e) => setForm({ ...form, socials: { ...form.socials, instagram: e.target.value } })} />
              </label>
              <label className="blog-field">
                <span>TikTok</span>
                <input value={form.socials.tiktok ?? ""} onChange={(e) => setForm({ ...form, socials: { ...form.socials, tiktok: e.target.value } })} />
              </label>
              <label className="blog-field">
                <span>X</span>
                <input value={form.socials.x ?? ""} onChange={(e) => setForm({ ...form, socials: { ...form.socials, x: e.target.value } })} />
              </label>
            </div>
          </section>

          <div className="blog-more blog-form-actions">
            <button type="submit" className="btn-hero blog-form-primary" disabled={submitting || uploadingImage}>
              {submitting ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Ajouter le membre"}
            </button>
            <button
              type="button"
              className="btn-hero-out blog-form-secondary"
              onClick={() => {
                setForm(EMPTY_FORM);
                setIsEditing(false);
              }}
            >
              {isEditing ? "Annuler les modifications" : "Réinitialiser"}
            </button>
          </div>
        </form>

        {message ? <p className={`lead blog-message ${message.type === "error" ? "blog-message-error" : "blog-message-success"}`}>{message.text}</p> : null}

        <div className="card blog-posts-card">
          {loading ? (
            <p>Chargement…</p>
          ) : (
            members
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((member) => (
                <div key={member.slug} className="blog-post-item">
                  <strong>{member.name}</strong> ({member.role}) · ton {member.tone}
                  <div className="blog-post-actions">
                    <button
                      type="button"
                      className="ca-btn"
                      onClick={() => {
                        setForm(member);
                        setIsEditing(true);
                      }}
                    >
                      Modifier
                    </button>
                    <button type="button" className="ca-btn" onClick={() => void deleteMember(member.slug)}>
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

