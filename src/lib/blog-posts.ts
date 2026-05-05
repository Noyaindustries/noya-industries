import { prisma } from "@/lib/prisma";

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  dateLabel: string;
  readTime: string;
  featured?: boolean;
  content: string[];
  order?: number;
};

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
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
      "Notre methode commence par une cartographie des irritants operationnels et des gains attendus sous 90 jours, avant toute decision technologique.",
      "Le resultat: une feuille de route realiste, des quick wins mesurables et une adoption terrain nettement superieure.",
    ],
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
    content: [
      "WhatsApp accelere la relation client, mais ne remplace pas un systeme de suivi commercial structure.",
      "Sans pipeline, les opportunites se perdent entre messages, les relances se decalquent mal, et la prevision reste intuitive.",
      "Un CRM bien configure ne ralentit pas les equipes: il standardise les etapes, preserve l'historique et rend la performance visible.",
      "Le bon compromis consiste a conserver les canaux familiers, tout en centralisant les donnees et les alertes de suivi.",
    ],
  },
  {
    slug: "competences-digitales-manager-afrique-2026",
    category: "Academy",
    title: "Les 5 competences digitales indispensables pour manager en Afrique en 2026",
    excerpt:
      "Data literacy, pilotage des outils collaboratifs et leadership digital: les fondamentaux identifies par notre equipe Academy.",
    imageUrl: "/landing/noya-brand-mark.jpg",
    dateLabel: "Janv. 2026",
    readTime: "7 min",
    content: [
      "Le manager digital ne doit pas coder: il doit comprendre les indicateurs, arbitrer rapidement et orchestrer la collaboration.",
      "La maitrise des tableaux de bord, des routines d'equipe et de l'automatisation legere devient un avantage concurrentiel direct.",
      "Le vrai changement est culturel: clarifier les responsabilites, formaliser les process et instaurer des rituels de suivi.",
      "Les entreprises qui montent en competence management reduisent fortement les retards et les decisions improvises.",
    ],
  },
  {
    slug: "creer-startup-cote-divoire-guide-ohada",
    category: "Startup Studio",
    title: "Creer une startup en Cote d'Ivoire en 2026 : guide pratique OHADA",
    excerpt:
      "De la validation marche a la structuration juridique, les etapes critiques pour lancer une startup durable en contexte local.",
    imageUrl: "/landing/noya-brand-mark.jpg",
    dateLabel: "Dec. 2025",
    readTime: "9 min",
    content: [
      "La vitesse de lancement est importante, mais la clarte du modele economique l'est encore plus.",
      "En pratique, les erreurs les plus couteuses concernent la gouvernance, les contrats fondateurs et la gestion de tresorerie initiale.",
      "Le cadre OHADA offre une base solide, a condition d'anticiper les obligations et de documenter les roles des associes.",
      "Un startup studio reduit ce risque en apportant methode, outillage et encadrement sur les premiers mois critiques.",
    ],
  },
  {
    slug: "audit-digital-48h-ce-que-revele-votre-presence-en-ligne",
    category: "Consulting",
    title: "Audit digital en 48h : ce que revele vraiment votre presence en ligne",
    excerpt:
      "Trafic, conversion, credibilite: ce qu'un audit rapide met en evidence et les actions prioritaires a deployer.",
    imageUrl: "/landing/noya-brand-mark.jpg",
    dateLabel: "Nov. 2025",
    readTime: "5 min",
    content: [
      "Un audit court n'est pas superficiel: il force la priorisation sur les facteurs qui impactent directement la conversion.",
      "La plupart des entreprises surestiment leur visibilite et sous-estiment la friction de leurs parcours utilisateurs.",
      "En 48h, on peut identifier les 20% d'actions qui produisent 80% d'impact, sans engager de refonte complete.",
      "Le livrable doit etre actionnable immediatement, avec responsables, delais et indicateurs associes.",
    ],
  },
  {
    slug: "site-web-ivoirien-mobile-first-donnees",
    category: "Tech",
    title: "Votre site web ivoirien doit etre mobile-first — les donnees le prouvent",
    excerpt:
      "Performance mobile, lisibilite et vitesse de chargement: les piliers indispensables pour capter et convertir.",
    imageUrl: "/landing/noya-brand-mark.jpg",
    dateLabel: "Oct. 2025",
    readTime: "6 min",
    content: [
      "Le mobile est deja le point d'entree principal pour de nombreux parcours d'achat et de prise de contact.",
      "Un site esthetique mais lent sur mobile detruit la confiance avant meme la premiere interaction utile.",
      "Le mobile-first implique des choix concrets: hierarchiser l'information, limiter le poids des pages et simplifier les formulaires.",
      "Les gains sont mesurables rapidement sur le taux de rebond, le temps de session et les conversions.",
    ],
  },
];

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!process.env.DATABASE_URL) {
      return sortPosts(FALLBACK_BLOG_POSTS);
    }
    const rows = await prisma.blogPost.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) return sortPosts(FALLBACK_BLOG_POSTS);
    return rows;
  } catch {
    return sortPosts(FALLBACK_BLOG_POSTS);
  }
}

export async function getFeaturedPost(posts?: BlogPost[]): Promise<BlogPost> {
  const allPosts = posts ?? (await getBlogPosts());
  return allPosts.find((post) => post.featured) ?? allPosts[0];
}

export async function getSecondaryPosts(posts?: BlogPost[]): Promise<BlogPost[]> {
  const allPosts = posts ?? (await getBlogPosts());
  const featured = await getFeaturedPost(allPosts);
  return allPosts.filter((post) => post.slug !== featured.slug).slice(0, 2);
}

export async function getMiniPosts(posts?: BlogPost[]): Promise<BlogPost[]> {
  const allPosts = posts ?? (await getBlogPosts());
  const featured = await getFeaturedPost(allPosts);
  return allPosts.filter((post) => post.slug !== featured.slug).slice(2, 5);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const allPosts = await getBlogPosts();
  return allPosts.find((post) => post.slug === slug);
}
