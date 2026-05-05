"use client";

import { useEffect, useRef, useState } from "react";
import { FALLBACK_TEAM_MEMBERS, type TeamMemberRecord, type TeamSocialKind } from "@/lib/team-members";

type TeamMember = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  roleClass: "team-role-gold" | "team-role-blue" | "team-role-green";
  desc: string;
  skills: string[];
  /** `null` = avatar à initiales (pas de photo) */
  photo: string | null;
  socials: {
    label: string;
    href: string;
    kind: "linkedin" | "facebook" | "instagram" | "tiktok" | "x";
  }[];
};

function avatarToneFromRole(roleClass: TeamMember["roleClass"]): "gold" | "blue" | "green" {
  if (roleClass.includes("gold")) return "gold";
  if (roleClass.includes("green")) return "green";
  return "blue";
}

function roleClassFromTone(tone: "gold" | "blue" | "green"): TeamMember["roleClass"] {
  if (tone === "gold") return "team-role-gold";
  if (tone === "green") return "team-role-green";
  return "team-role-blue";
}

function toTeamMembers(records: TeamMemberRecord[]): TeamMember[] {
  return records.map((member) => {
    const socialEntries: { kind: TeamSocialKind; label: string }[] = [
      { kind: "linkedin", label: "LinkedIn" },
      { kind: "facebook", label: "Facebook" },
      { kind: "instagram", label: "Instagram" },
      { kind: "tiktok", label: "TikTok" },
      { kind: "x", label: "X" },
    ];
    const socials = [
      ...socialEntries.map((entry) => ({
        label: entry.label,
        href: member.socials[entry.kind] ?? "",
        kind: entry.kind,
      })),
    ].filter((social) => social.href && social.href.trim().length > 0);
    return {
      slug: member.slug,
      initials: member.initials,
      name: member.name,
      role: member.role,
      roleClass: roleClassFromTone(member.tone),
      desc: member.desc,
      skills: member.skills,
      photo: member.imageUrl,
      socials,
    };
  });
}

export function NoyaLandingTeam() {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => toTeamMembers(FALLBACK_TEAM_MEMBERS));

  useEffect(() => {
    queueMicrotask(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    void fetch("/api/dashboard/team", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { members?: TeamMemberRecord[] };
        if (!data.members || data.members.length === 0) return;
        setTeamMembers(toTeamMembers(data.members));
      })
      .catch(() => {});
  }, []);

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
            {teamMembers.map((member, idx) => {
              return (
            <article
              key={member.slug}
              className={`team-card rv${idx === 1 ? " d1" : ""}${idx === 2 ? " d2" : ""}`}
            >
              {isHydrated && member.photo ? (
                <img
                  className="team-photo"
                  src={member.photo}
                  alt={`Portrait de ${member.name}`}
                  loading="lazy"
                />
              ) : (
                <div
                  className={`team-photo team-photo--avatar team-photo--avatar-${avatarToneFromRole(member.roleClass)}`}
                  role="img"
                  aria-label={`Avatar de ${member.name}`}
                >
                  <span className="team-photo-initials" aria-hidden="true">
                    {member.initials}
                  </span>
                </div>
              )}
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
                <p className="team-bio">{member.desc}</p>
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
