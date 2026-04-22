export type AcademySectionId =
  | "overview"
  | "programs"
  | "learners"
  | "calendar";

export const ACADEMY_NAV: { id: AcademySectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "programs", label: "Programmes" },
  { id: "learners", label: "Apprenants" },
  { id: "calendar", label: "Calendrier" },
];

export const ACADEMY_SECTION_LABELS: Record<AcademySectionId, string> = {
  overview: "Synthèse",
  programs: "Programmes",
  learners: "Apprenants",
  calendar: "Calendrier",
};
