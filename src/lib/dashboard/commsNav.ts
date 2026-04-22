export type CommsSectionId =
  | "overview"
  | "inbox"
  | "campaigns"
  | "templates";

export const COMMS_NAV: { id: CommsSectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "inbox", label: "Boîte" },
  { id: "campaigns", label: "Campagnes" },
  { id: "templates", label: "Modèles" },
];

export const COMMS_SECTION_LABELS: Record<CommsSectionId, string> = {
  overview: "Synthèse",
  inbox: "Boîte",
  campaigns: "Campagnes",
  templates: "Modèles",
};
