export type HrSectionId = "overview" | "team" | "workload" | "absences";

export const HR_NAV: { id: HrSectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "team", label: "Équipe" },
  { id: "workload", label: "Charge" },
  { id: "absences", label: "Congés" },
];

export const HR_SECTION_LABELS: Record<HrSectionId, string> = {
  overview: "Synthèse",
  team: "Équipe",
  workload: "Charge",
  absences: "Congés",
};
