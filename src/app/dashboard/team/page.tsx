"use client";

import { TeamMembersManager } from "@/components/dashboard/team/TeamMembersManager";
import Link from "next/link";

export default function DashboardTeamPage() {
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
        <TeamMembersManager />
      </div>
    </section>
  );
}

