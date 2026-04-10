import { prisma } from "@/lib/prisma";

export const fallbackServices = [
  {
    slug: "strategy-clarity",
    title: "Clarification stratégique",
    subtitle: "Priorités & impact",
    description:
      "Nous aidons les dirigeants à trier le bruit des signaux : objectifs, leviers critiques et feuille de route actionnable pour l’organisation africaine et internationale.",
    order: 0,
  },
  {
    slug: "innovation-labs",
    title: "Innovation & écosystèmes",
    subtitle: "R&D, hubs, partenariats",
    description:
      "Conception de programmes d’innovation, hubs, alliances public-privé-académique et feuilles de route technologiques alignées sur les réalités locales.",
    order: 1,
  },
  {
    slug: "transformation",
    title: "Transformation opérationnelle",
    subtitle: "Processus & culture",
    description:
      "Affinage des processus, gouvernance agile et accompagnement du changement pour des équipes plus résilientes et orientées résultats.",
    order: 2,
  },
  {
    slug: "executive-advisory",
    title: "Conseil de direction",
    subtitle: "Décisions à haut enjeu",
    description:
      "Sparring partner pour boards et COMEX : due diligence stratégique, scénarios, communication de crise et alignement des parties prenantes.",
    order: 3,
  },
] as const;

export const fallbackStats = [
  { label: "Années d’expérience cumulée", value: "25+", order: 0 },
  { label: "Pays couverts", value: "12", order: 1 },
  { label: "Projets stratégiques", value: "80+", order: 2 },
  { label: "Taux de satisfaction client", value: "97%", order: 3 },
] as const;

export async function getServices() {
  try {
    if (!process.env.DATABASE_URL) {
      return [...fallbackServices];
    }
    const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) return [...fallbackServices];
    return rows;
  } catch {
    return [...fallbackServices];
  }
}

export async function getStats() {
  try {
    if (!process.env.DATABASE_URL) {
      return [...fallbackStats];
    }
    const rows = await prisma.stat.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) return [...fallbackStats];
    return rows;
  } catch {
    return [...fallbackStats];
  }
}
