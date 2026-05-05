"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type CommentRecord = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

type BlogCommentsProps = {
  slug: string;
};

export function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function loadComments() {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as { comments?: CommentRecord[]; error?: string };
      if (!response.ok) {
        setFeedback({ type: "error", text: data.error ?? "Commentaires indisponibles." });
        setComments([]);
        return;
      }
      setComments(data.comments ?? []);
    } catch {
      setFeedback({ type: "error", text: "Erreur réseau lors du chargement des commentaires." });
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadComments();
  }, [slug]);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    if (!author.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Ajoute ton nom et ton commentaire." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, author: author.trim(), message: message.trim() }),
      });
      const data = (await response.json()) as { comment?: CommentRecord; error?: string };
      if (!response.ok || !data.comment) {
        setFeedback({ type: "error", text: data.error ?? "Impossible d'envoyer le commentaire." });
        return;
      }
      setComments((previous) => [data.comment as CommentRecord, ...previous]);
      setAuthor("");
      setMessage("");
      setFeedback({ type: "success", text: "Commentaire publié." });
    } catch {
      setFeedback({ type: "error", text: "Erreur réseau pendant l'envoi." });
    } finally {
      setSubmitting(false);
    }
  }

  const commentCountLabel = useMemo(() => {
    if (comments.length <= 1) return `${comments.length} commentaire`;
    return `${comments.length} commentaires`;
  }, [comments.length]);

  return (
    <section className="blog-comments" aria-label="Commentaires">
      <h2 className="blog-comments-title">Commentaires</h2>
      <p className="blog-comments-count">{loading ? "Chargement..." : commentCountLabel}</p>

      <form className="blog-comments-form" onSubmit={submitComment}>
        <label className="blog-comments-field">
          <span>Nom</span>
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Ton nom"
            maxLength={80}
          />
        </label>
        <label className="blog-comments-field">
          <span>Commentaire</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Partage ton avis..."
            maxLength={2000}
          />
        </label>
        <button type="submit" className="btn-hero" disabled={submitting}>
          {submitting ? "Envoi..." : "Publier le commentaire"}
        </button>
      </form>

      {feedback ? (
        <p className={`blog-comments-feedback ${feedback.type === "error" ? "is-error" : "is-success"}`}>
          {feedback.text}
        </p>
      ) : null}

      <div className="blog-comments-list">
        {!loading && comments.length === 0 ? (
          <p className="blog-comments-empty">Sois le premier à commenter cet article.</p>
        ) : null}
        {comments.map((comment) => (
          <article key={comment.id} className="blog-comment-item">
            <header>
              <strong>{comment.author}</strong>
              <span>{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</span>
            </header>
            <p>{comment.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

