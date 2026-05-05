import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.blogPost.deleteMany();
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

  await prisma.blogPost.createMany({
    data: [
      {
        slug: "transformation-digitale-pme-ivoiriennes",
        category: "Consulting",
        title:
          "Pourquoi 70% des PME ivoiriennes échouent leur transformation digitale — et comment l'eviter",
        excerpt:
          "Apres 100+ audits menes en Cote d'Ivoire, nos equipes ont isole cinq erreurs recurrentes et les leviers concrets pour en sortir rapidement.",
        imageUrl: "/landing/noya-brand-mark.jpg",
        dateLabel: "Mars 2026",
        readTime: "8 min",
        featured: true,
        content: [
          "La transformation digitale n'est pas un projet IT. C'est d'abord un projet de priorites business, de leadership et de discipline operationnelle.",
          "Les echecs viennent souvent d'un demarrage sans diagnostic initial, d'outils choisis sans alignement metier, et d'un changement humain mal prepare.",
        ],
        order: 0,
      },
      {
        slug: "crm-vs-whatsapp-efficacite-commerciale",
        category: "Tech",
        title: "CRM vs WhatsApp : vos equipes commerciales perdent 30% de leur efficacite",
        excerpt:
          "Etude terrain sur 50 equipes commerciales: les limites du pilotage a la conversation et les conditions d'une transition CRM reussie.",
        imageUrl: "/landing/noya-brand-mark.jpg",
        dateLabel: "Fev. 2026",
        readTime: "6 min",
        featured: false,
        content: [
          "WhatsApp accelere la relation client, mais ne remplace pas un systeme de suivi commercial structure.",
          "Un CRM bien configure ne ralentit pas les equipes: il standardise les etapes et preserve l'historique.",
        ],
        order: 1,
      },
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
