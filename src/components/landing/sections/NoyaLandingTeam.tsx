"use client";

import { useRef } from "react";

type TeamMember = {
  initials: string;
  name: string;
  role: string;
  roleClass: string;
  desc: string;
  skills: string[];
  photo: string;
  socials: {
    label: string;
    href: string;
    kind: "linkedin" | "facebook" | "instagram" | "tiktok" | "x";
  }[];
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    initials: "YA",
    name: "N'guessan Opely Yannick Abraham",
    role: "Fondateur & Directeur Général",
    roleClass: "team-role-gold",
    desc: "Stratégie, développement commercial et pilotage global du groupe Noya Industries.",
    skills: ["Stratégie", "Développement commercial", "Pilotage global"],
    photo: "/landing/team/opely.png",
    socials: [
      { label: "LinkedIn", href: "#", kind: "linkedin" },
      { label: "Facebook", href: "#", kind: "facebook" },
      { label: "Instagram", href: "#", kind: "instagram" },
    ],
  },
  {
    initials: "JY",
    name: "Jahmmy Yapo Ahue",
    role: "Responsable Pôle Technologique",
    roleClass: "team-role-blue",
    desc: "Supervision des projets tech, coordination des équipes de développement et garantie qualité des livrables.",
    skills: ["Supervision tech", "Coordination équipes", "Qualité livrables"],
    photo: "/landing/team/jahmmy.jpg",
    socials: [
      { label: "LinkedIn", href: "#", kind: "linkedin" },
      { label: "Instagram", href: "#", kind: "instagram" },
      { label: "X", href: "#", kind: "x" },
    ],
  },
  {
    initials: "KS",
    name: "Kouassi Stéphane",
    role: "Responsable Technique Logiciels",
    roleClass: "team-role-green",
    desc: "Développement et maintenance des solutions logicielles.",
    skills: ["Développement logiciel", "Maintenance", "Fiabilité"],
    photo: "/landing/team/stephane.png",
    socials: [
      { label: "LinkedIn", href: "#", kind: "linkedin" },
      { label: "TikTok", href: "#", kind: "tiktok" },
      { label: "Facebook", href: "#", kind: "facebook" },
    ],
  },
  {
    initials: "JK",
    name: "Jean-Loïc Koné",
    role: "Développeur Fullstack & Designer",
    roleClass: "team-role-blue",
    desc: "Développement des interfaces, conception graphique et livraison des projets web du groupe.",
    skills: ["Fullstack", "Design UI", "Livraison web"],
    photo: "/landing/team/jean-loic.jpg",
    socials: [
      { label: "LinkedIn", href: "#", kind: "linkedin" },
      { label: "Instagram", href: "#", kind: "instagram" },
      { label: "Facebook", href: "#", kind: "facebook" },
    ],
  },
  {
    initials: "JB",
    name: "Jean Bilboa",
    role: "Consultant Technologique",
    roleClass: "team-role-gold",
    desc: "Conseil en architecture système, évaluation des solutions tech et structuration des roadmaps produit.",
    skills: ["Architecture système", "Évaluation tech", "Roadmap produit"],
    photo: "/landing/team/bilboa.jpg",
    socials: [
      { label: "LinkedIn", href: "#", kind: "linkedin" },
      { label: "X", href: "#", kind: "x" },
      { label: "Facebook", href: "#", kind: "facebook" },
    ],
  },
  {
    initials: "SE",
    name: "Sah Hugue Edgar",
    role: "Business Developer",
    roleClass: "team-role-green",
    desc: "Prospection, développement des partenariats et pilotage des cycles de vente PADDE-CI, Infinite Core et PRESENZ.",
    skills: ["Prospection", "Partenariats", "Cycles de vente"],
    photo: "/landing/team/edgar.jpg",
    socials: [
      { label: "LinkedIn", href: "#", kind: "linkedin" },
      { label: "Instagram", href: "#", kind: "instagram" },
      { label: "TikTok", href: "#", kind: "tiktok" },
    ],
  },
  {
    initials: "MI",
    name: "Mbaka Laeticia Imagna",
    role: "Assistante Polyvalente",
    roleClass: "team-role-blue",
    desc: "Gestion de la boutique African Concept Store, phoning et prospection PADDE-CI, animation des réseaux sociaux.",
    skills: ["Concept Store", "Phoning & prospection", "Réseaux sociaux"],
    photo: "/landing/team/laeticia.jpg",
    socials: [
      { label: "Facebook", href: "#", kind: "facebook" },
      { label: "Instagram", href: "#", kind: "instagram" },
      { label: "TikTok", href: "#", kind: "tiktok" },
    ],
  },
];

export function NoyaLandingTeam() {
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  const scrollCards = (direction: "left" | "right") => {
    const container = marqueeRef.current;
    if (!container) return;

    const amount = Math.max(260, Math.round(container.clientWidth * 0.72));
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section className="sec" id="team">
        <p className="eyebrow rv">L'équipe</p>
        <h2 className="display rv d1">Les personnes qui<br /><em>construisent le groupe.</em></h2>
        <div className="team-controls rv d1">
          <button type="button" className="team-scroll-btn" onClick={() => scrollCards("left")}>
            ←
          </button>
          <button type="button" className="team-scroll-btn" onClick={() => scrollCards("right")}>
            →
          </button>
        </div>
        <div className="team-marquee" ref={marqueeRef}>
          <div className="team-track">
            {TEAM_MEMBERS.map((member, idx) => {
              return (
            <article
              key={`${member.name}-${idx}`}
              className={`team-card rv${idx === 1 ? " d1" : ""}${idx === 2 ? " d2" : ""}`}
            >
              <img
                className="team-photo"
                src={member.photo}
                alt={`Portrait de ${member.name}`}
                loading="lazy"
              />
              <div className="team-photo-shade" />
              <div className="team-bottom">
                <div className="team-head-row">
                  <div>
                    <div className="team-name">{member.name}</div>
                    <div className={`team-role ${member.roleClass}`}>{member.role}</div>
                  </div>
                  <div className="team-socials" aria-label={`Réseaux sociaux de ${member.name}`}>
                    {member.socials.map((social) => (
                      <a
                        key={`${member.initials}-${social.kind}`}
                        href={social.href}
                        className={`team-social ts-${social.kind}`}
                        title={social.label}
                        aria-label={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.kind === "linkedin" ? "in" : null}
                        {social.kind === "facebook" ? "f" : null}
                        {social.kind === "instagram" ? "◉" : null}
                        {social.kind === "tiktok" ? "♪" : null}
                        {social.kind === "x" ? "𝕏" : null}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="team-skills">
                  {member.skills.map((skill) => (
                    <span key={`${member.initials}-${skill}`} className="ts">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="team-hover-panel">
                <p className="team-desc">{member.desc}</p>
              </div>
            </article>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}
