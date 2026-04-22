export type SettingsSectionId =
  | "overview"
  | "account"
  | "security"
  | "integrations";

export const SETTINGS_NAV: { id: SettingsSectionId; label: string }[] = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "account", label: "Compte" },
  { id: "security", label: "Sécurité" },
  { id: "integrations", label: "Intégrations" },
];

export const SETTINGS_SECTION_LABELS: Record<SettingsSectionId, string> = {
  overview: "Vue d'ensemble",
  account: "Compte",
  security: "Sécurité",
  integrations: "Intégrations",
};
