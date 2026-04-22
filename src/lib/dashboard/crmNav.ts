export type CrmSectionId =
  | "overview"
  | "pipeline"
  | "accounts"
  | "activities";

export const CRM_NAV: { id: CrmSectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "pipeline", label: "Pipeline" },
  { id: "accounts", label: "Comptes" },
  { id: "activities", label: "Activités" },
];

export const CRM_SECTION_LABELS: Record<CrmSectionId, string> = {
  overview: "Synthèse",
  pipeline: "Pipeline",
  accounts: "Comptes",
  activities: "Activités",
};
