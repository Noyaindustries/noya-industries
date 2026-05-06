"use client";

import Link from "next/link";
import { BlogPostsManager } from "@/components/dashboard/blog/BlogPostsManager";

export default function DashboardBlogPage() {
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
        <BlogPostsManager />
      </div>
    </section>
  );
}
