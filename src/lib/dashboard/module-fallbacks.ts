export const FALLBACK_CRM_CLIENTS = [
  { slug: "kofi-freres", name: "Kofi & Frères", sector: "Commerce", pole: "consulting", value: 430000, contactDate: "02 Avr", status: "actif", initials: "KF", avBg: "var(--gold)", avColor: "#000", order: 0 },
  { slug: "ste-coulibaly", name: "Sté Coulibaly", sector: "Industrie", pole: "consulting", value: 280000, contactDate: "04 Avr", status: "actif", initials: "SC", avBg: "var(--cobalt2)", avColor: null, order: 1 },
  { slug: "cabinet-diomande", name: "Cabinet Diomandé", sector: "Conseil", pole: "tech", value: 950000, contactDate: "01 Avr", status: "relance", initials: "CD", avBg: "var(--green)", avColor: null, order: 2 },
  { slug: "groupe-ouattara", name: "Groupe Ouattara", sector: "BTP", pole: "consulting", value: 120000, contactDate: "30 Mar", status: "retard", initials: "GO", avBg: "var(--purple)", avColor: null, order: 3 },
  { slug: "lonaci", name: "LONACI", sector: "Institution", pole: "consulting", value: 2400000, contactDate: "03 Avr", status: "actif", initials: "LO", avBg: "#F59E0B", avColor: null, order: 4 },
] as const;

export const FALLBACK_CRM_ACTIVITIES = [
  { title: "Relance devis Infinite Core", clientName: "Cabinet Diomandé", type: "call", dateLabel: "08 Avr", status: "pending", order: 0 },
  { title: "Point trimestriel", clientName: "LONACI", type: "meeting", dateLabel: "10 Avr", status: "planned", order: 1 },
  { title: "Envoi proposition Academy", clientName: "École Riviera", type: "email", dateLabel: "07 Avr", status: "done", order: 2 },
] as const;

export const FALLBACK_INVOICES = [
  { number: "F-2026-052", client: "Sté Coulibaly", mission: "Audit Business", dateLabel: "02 Avr", dueLabel: "17 Avr", amount: 280000, amountTone: "gold", status: "payé", order: 0 },
  { number: "F-2026-051", client: "Kofi & Frères", mission: "Audit Rapide", dateLabel: "01 Avr", dueLabel: "16 Avr", amount: 150000, amountTone: "gold", status: "payé", order: 1 },
  { number: "F-2026-047", client: "Cabinet Diomandé", mission: "PRESENZ PRO", dateLabel: "28 Mar", dueLabel: "07 Avr", amount: 450000, amountTone: "red", status: "retard", order: 2 },
  { number: "F-2026-049", client: "Marc Touré", mission: "Formation", dateLabel: "30 Mar", dueLabel: "14 Avr", amount: 75000, amountTone: "gold", status: "attente", order: 3 },
  { number: "F-2026-050", client: "Groupe Ouattara", mission: "Community", dateLabel: "01 Avr", dueLabel: "15 Avr", amount: 120000, amountTone: "gold", status: "attente", order: 4 },
  { number: "F-2026-045", client: "LONACI", mission: "Audit Institutionnel", dateLabel: "25 Mar", dueLabel: "24 Avr", amount: 1200000, amountTone: "gold", status: "partiel", order: 5 },
] as const;

export const FALLBACK_PROJECTS = [
  { slug: "padde-ci-audit-014", name: "PADDE-CI Audit #014", client: "LONACI", ownerInitials: "YN", ownerBg: "var(--gold)", ownerColor: "#000", deadline: "18 Avr", deadlineWarn: false, progress: 75, barColor: "var(--gold)", status: "en_cours", order: 0 },
  { slug: "presenz-pro-012", name: "PRESENZ PRO #012", client: "Grp. Ouattara", ownerInitials: "KS", ownerBg: "var(--cobalt2)", ownerColor: null, deadline: "05 Avr ⚠", deadlineWarn: true, progress: 52, barColor: "var(--red)", status: "retard", order: 1 },
  { slug: "infinite-core-deploy", name: "Infinite Core Deploy", client: "Cabinet Diomandé", ownerInitials: "KS", ownerBg: "var(--green)", ownerColor: null, deadline: "22 Avr", deadlineWarn: false, progress: 85, barColor: "var(--green)", status: "avance", order: 2 },
  { slug: "formation-mktg-digital", name: "Formation Mktg Digital", client: "École Riviera", ownerInitials: "JL", ownerBg: "var(--purple)", ownerColor: null, deadline: "25 Avr", deadlineWarn: false, progress: 30, barColor: "var(--purple)", status: "en_cours", order: 3 },
  { slug: "community-koffi-008", name: "Community Koffi #008", client: "Kofi & Frères", ownerInitials: "JL", ownerBg: "var(--gold2)", ownerColor: "#000", deadline: "Mensuel", deadlineWarn: false, progress: 100, barColor: "var(--gold)", status: "livre", order: 4 },
] as const;

export const FALLBACK_STOCK_ITEMS = [
  { ref: "NK-PAPER-A4", label: "Ramette papier A4", category: "Fournitures", quantity: 48, price: 3500, minQuantity: 10, order: 0 },
  { ref: "NK-TONER-HP", label: "Toner HP compatible", category: "Informatique", quantity: 6, price: 22000, minQuantity: 4, order: 1 },
  { ref: "NK-CAFE-1KG", label: "Café grain 1 kg", category: "Accueil", quantity: 12, price: 8500, minQuantity: 5, order: 2 },
  { ref: "NK-USB-C", label: "Câbles USB-C", category: "Informatique", quantity: 3, price: 4500, minQuantity: 8, order: 3 },
] as const;

export const FALLBACK_ACADEMY_PROGRAMS = [
  { slug: "marketing-digital-fondamentaux", name: "Marketing Digital Fondamentaux", type: "presentiel", learners: 24, progress: 60, nextSession: "14 Avr", order: 0 },
  { slug: "gestion-digitale-pme", name: "Gestion Digitale PME", type: "ligne", learners: 38, progress: 82, nextSession: "En continu", order: 1 },
  { slug: "leadership-management", name: "Leadership & Management", type: "presentiel", learners: 12, progress: 30, nextSession: "19 Avr", order: 2 },
  { slug: "community-management", name: "Community Management", type: "hybride", learners: 10, progress: 100, nextSession: "Terminé", order: 3 },
] as const;

export const FALLBACK_LEAVE_REQUESTS = [
  { employeeName: "Mariama Baldé", periodLabel: "07-12 Avr", durationLabel: "5 jours", reason: "Congé annuel", status: "approved", order: 0 },
  { employeeName: "Aminata Touré", periodLabel: "18-19 Avr", durationLabel: "2 jours", reason: "Personnel", status: "pending", order: 1 },
  { employeeName: "Stéphane Konan", periodLabel: "28 Avr - 02 Mai", durationLabel: "5 jours", reason: "Formation", status: "reviewed", order: 2 },
] as const;

export const FALLBACK_COMMS_TEMPLATES = [
  { slug: "accuse-reception-contact", name: "Accusé réception contact", channel: "email", subject: "Nous avons bien reçu votre message", body: "Bonjour {{name}},\n\nMerci pour votre message. Notre équipe vous répond sous 48h ouvrées.\n\n— Noya Industries", order: 0 },
  { slug: "relance-devis", name: "Relance devis", channel: "email", subject: "Suivi de votre proposition Noya", body: "Bonjour {{name}},\n\nNous souhaitions faire un point sur la proposition transmise le {{date}}.\n\nCordialement,\nNoya Industries", order: 1 },
  { slug: "invitation-academy", name: "Invitation Academy", channel: "email", subject: "Prochaine session — Noya Academy", body: "Bonjour,\n\nNous avons le plaisir de vous inviter à notre prochaine session {{programme}}.\n\nInscriptions ouvertes.", order: 2 },
] as const;

export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount).replace(/\s/g, " ");
}
