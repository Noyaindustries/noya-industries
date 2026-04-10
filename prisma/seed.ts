import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.service.deleteMany();
  await prisma.stat.deleteMany();

  await prisma.service.createMany({
    data: [
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
    ],
  });

  await prisma.stat.createMany({
    data: [
      { label: "Années d’expérience cumulée", value: "25+", order: 0 },
      { label: "Pays couverts", value: "12", order: 1 },
      { label: "Projets stratégiques", value: "80+", order: 2 },
      { label: "Taux de satisfaction client", value: "97%", order: 3 },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
