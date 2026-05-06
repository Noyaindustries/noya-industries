export type TeamTone = "gold" | "blue" | "green";

export type TeamSocialKind = "linkedin" | "facebook" | "instagram" | "tiktok" | "x";

export type TeamSocial = {
  kind: TeamSocialKind;
  label: string;
  href: string;
};

export type TeamMemberRecord = {
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

export const FALLBACK_TEAM_MEMBERS: TeamMemberRecord[] = [
  {
    slug: "nguessan-opely-yannick-abraham",
    initials: "YA",
    name: "N'guessan Opely Yannick Abraham",
    role: "Fondateur & Directeur Général",
    tone: "gold",
    desc: "Stratégie, développement commercial et pilotage global du groupe Noya Industries.",
    skills: ["Stratégie", "Développement commercial", "Pilotage global"],
    imageUrl: "/landing/team/opely.png",
    socials: { linkedin: "#", facebook: "#", instagram: "#", tiktok: null, x: null },
    order: 0,
  },
  {
    slug: "jahmmy-yapo-ahue",
    initials: "JY",
    name: "Jahmmy Yapo Ahue",
    role: "Responsable Pôle Technologique",
    tone: "blue",
    desc: "Supervision des projets tech, coordination des équipes de développement et garantie qualité des livrables.",
    skills: ["Supervision tech", "Coordination équipes", "Qualité livrables"],
    imageUrl: null,
    socials: { linkedin: "#", facebook: null, instagram: "#", tiktok: null, x: "#" },
    order: 1,
  },
  {
    slug: "kouassi-stephane",
    initials: "KS",
    name: "Kouassi Stéphane",
    role: "Responsable Technique Logiciels",
    tone: "green",
    desc: "Développement et maintenance des solutions logicielles.",
    skills: ["Développement logiciel", "Maintenance", "Fiabilité"],
    imageUrl: "/landing/team/stephane.png",
    socials: { linkedin: "#", facebook: "#", instagram: null, tiktok: "#", x: null },
    order: 2,
  },
  {
    slug: "jean-loic-kone",
    initials: "JK",
    name: "Jean-Loïc Koné",
    role: "Développeur Fullstack & Designer",
    tone: "blue",
    desc: "Développement des interfaces, conception graphique et livraison des projets web du groupe.",
    skills: ["Fullstack", "Design UI", "Livraison web"],
    imageUrl: null,
    socials: { linkedin: "#", facebook: "#", instagram: "#", tiktok: null, x: null },
    order: 3,
  },
  {
    slug: "hugues-armel-sah",
    initials: "SE",
    name: "Hugues - Armel sah",
    role: "Business Developer",
    tone: "green",
    desc: "Prospection, développement des partenariats et pilotage des cycles de vente PADDE-CI, Infinite Core et PRESENZ.",
    skills: ["Prospection", "Partenariats", "Cycles de vente"],
    imageUrl: null,
    socials: { linkedin: "#", facebook: null, instagram: "#", tiktok: "#", x: null },
    order: 4,
  },
];

