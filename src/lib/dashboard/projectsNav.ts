export type ProjectsSectionId =
  | "overview"
  | "portfolio"
  | "milestones"
  | "risks";

export const PROJECTS_NAV: { id: ProjectsSectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "portfolio", label: "Portefeuille" },
  { id: "milestones", label: "Jalons" },
  { id: "risks", label: "Risques" },
];

export const PROJECTS_SECTION_LABELS: Record<ProjectsSectionId, string> = {
  overview: "Synthèse",
  portfolio: "Portefeuille",
  milestones: "Jalons",
  risks: "Risques",
};
