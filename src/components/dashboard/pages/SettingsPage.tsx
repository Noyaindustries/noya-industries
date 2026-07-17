"use client";

import type { SettingsSectionId } from "@/lib/dashboard/settingsNav";
import type { AppSettingsRecord } from "@/lib/site-settings";
import { PasswordVisibilityButton } from "@/components/PasswordVisibilityButton";
import { useDashboardUi } from "../dashboardUiContext";
import { useCallback, useEffect, useMemo, useState } from "react";

type SettingsPageProps = {
  active: boolean;
  section: SettingsSectionId;
  onSettingsNavigate?: (s: SettingsSectionId) => void;
};

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function passwordStrengthHints(password: string): string[] {
  const hints: string[] = [];
  if (password.length < 12) hints.push("12 caractères minimum");
  if (!/[a-z]/.test(password)) hints.push("une minuscule");
  if (!/[A-Z]/.test(password)) hints.push("une majuscule");
  if (!/[0-9]/.test(password)) hints.push("un chiffre");
  if (!/[^a-zA-Z0-9]/.test(password)) hints.push("un symbole");
  return hints;
}

export function SettingsPage({ active, section, onSettingsNavigate }: SettingsPageProps) {
  const { pushToast } = useDashboardUi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [settings, setSettings] = useState<AppSettingsRecord | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(EMPTY_PASSWORD_FORM);
  const [showPasswords, setShowPasswords] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch("/api/dashboard/settings", { cache: "no-store" }),
        fetch("/api/dashboard/settings/profile", { cache: "no-store" }),
      ]);

      const settingsData = (await settingsRes.json()) as {
        settings?: AppSettingsRecord;
        databaseConnected?: boolean;
        error?: string;
      };

      if (settingsData.settings) {
        setSettings(settingsData.settings);
        setSavedSnapshot(JSON.stringify(settingsData.settings));
        setDatabaseConnected(Boolean(settingsData.databaseConnected));
      }

      if (profileRes.ok) {
        const profileData = (await profileRes.json()) as { profile?: AdminProfile };
        if (profileData.profile) {
          setProfile(profileData.profile);
          setProfileForm({
            name: profileData.profile.name,
            email: profileData.profile.email,
          });
        }
      }
    } catch {
      pushToast("Erreur lors du chargement des paramètres.");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (active) void loadSettings();
  }, [active, loadSettings]);

  const isDirty = useMemo(() => {
    if (!settings) return false;
    return JSON.stringify(settings) !== savedSnapshot;
  }, [savedSnapshot, settings]);

  const passwordHints = passwordStrengthHints(passwordForm.newPassword);
  const passwordReady =
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length > 0 &&
    passwordForm.confirmPassword.length > 0 &&
    passwordHints.length === 0 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const passwordAgeDays = useMemo(() => {
    if (!profile?.passwordChangedAt && !profile?.createdAt) return null;
    const base = new Date(profile.passwordChangedAt ?? profile.createdAt).getTime();
    return Math.floor((Date.now() - base) / (24 * 60 * 60 * 1000));
  }, [profile]);

  async function saveSettings(patch: Partial<AppSettingsRecord>, successMessage: string) {
    if (!settings) return;
    if (patch.contactEmail && !emailPattern.test(patch.contactEmail)) {
      pushToast("Email de contact invalide.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as { settings?: AppSettingsRecord; error?: string };
      if (!response.ok) {
        pushToast(data.error ?? "Enregistrement impossible.");
        return;
      }
      if (data.settings) {
        setSettings(data.settings);
        setSavedSnapshot(JSON.stringify(data.settings));
      }
      pushToast(successMessage);
    } catch {
      pushToast("Erreur réseau pendant l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile() {
    if (!emailPattern.test(profileForm.email)) {
      pushToast("Email administrateur invalide.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = (await response.json()) as { profile?: AdminProfile; error?: string };
      if (!response.ok) {
        pushToast(data.error ?? "Profil non enregistré.");
        return;
      }
      if (data.profile) {
        setProfile((prev) => ({ ...prev, ...data.profile! }));
        setProfileForm({ name: data.profile.name, email: data.profile.email });
      }
      pushToast("Profil administrateur mis à jour.");
    } catch {
      pushToast("Erreur réseau pendant la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!passwordReady) {
      pushToast(
        passwordHints.length > 0
          ? `Mot de passe trop faible : ${passwordHints.join(", ")}.`
          : "Vérifiez la confirmation du mot de passe.",
      );
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = (await response.json()) as {
        error?: string;
        reauthenticationRequired?: boolean;
      };
      if (!response.ok) {
        pushToast(data.error ?? "Mot de passe non modifié.");
        return;
      }
      setPasswordForm(EMPTY_PASSWORD_FORM);
      pushToast("Mot de passe administrateur mis à jour.");
      if (data.reauthenticationRequired) {
        window.location.assign("/admin-login?password=changed");
      }
    } catch {
      pushToast("Erreur réseau pendant le changement de mot de passe.");
    } finally {
      setSaving(false);
    }
  }

  async function testWebhook() {
    setTestingWebhook(true);
    try {
      const response = await fetch("/api/dashboard/settings/webhook-test", {
        method: "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        status?: number;
        endpoint?: string;
      };
      if (!response.ok) {
        pushToast(data.error ?? "Test webhook échoué.");
        return;
      }
      pushToast(
        `${data.message ?? "Webhook testé."}${data.status ? ` (HTTP ${data.status})` : ""}`,
      );
    } catch {
      pushToast("Erreur réseau pendant le test webhook.");
    } finally {
      setTestingWebhook(false);
    }
  }

  if (loading && !settings) {
    return (
      <div className={`page${active ? " active" : ""}`} id="page-settings">
        <div className="card">
          <div className="card-body db-stub">
            <div className="db-stub-desc">Chargement des paramètres…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`page${active ? " active" : ""}`} id="page-settings">
        <div className="card">
          <div className="card-body db-stub">
            <div className="db-stub-desc">Impossible de charger les paramètres.</div>
          </div>
        </div>
      </div>
    );
  }

  const rotationDue =
    passwordAgeDays !== null && passwordAgeDays >= settings.passwordRotationDays;

  return (
    <div className={`page${active ? " active" : ""}`} id="page-settings">
      {isDirty ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ padding: "12px 16px" }}>
            <span className="badge y">Modifications non enregistrées</span>
            <span style={{ marginLeft: 10, opacity: 0.75 }}>
              Enregistrez la section active pour appliquer les changements au site.
            </span>
          </div>
        </div>
      ) : null}

      {section === "overview" ? (
        <div className="grid-2">
          <button
            type="button"
            className="fin-report-tile"
            onClick={() => onSettingsNavigate?.("account")}
          >
            <span className="fin-report-ico">👤</span>
            <span className="fin-report-t">Compte & profil</span>
            <span className="fin-report-d">
              {profile?.name ?? settings.companyName} · {profile?.email ?? settings.contactEmail}
            </span>
          </button>
          <button
            type="button"
            className="fin-report-tile"
            onClick={() => onSettingsNavigate?.("security")}
          >
            <span className="fin-report-ico">🔐</span>
            <span className="fin-report-t">Sécurité</span>
            <span className="fin-report-d">
              Session {settings.sessionTimeoutEnabled ? "2 h" : "7 j"} · rotation{" "}
              {settings.passwordRotationDays} j
              {rotationDue ? " · rotation due" : ""}
            </span>
          </button>
          <button
            type="button"
            className="fin-report-tile"
            onClick={() => onSettingsNavigate?.("integrations")}
          >
            <span className="fin-report-ico">🔌</span>
            <span className="fin-report-t">Intégrations</span>
            <span className="fin-report-d">
              Infinite Core {settings.infinitecoreWebhookEnabled ? "actif" : "inactif"}
            </span>
          </button>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">⚙️ État du système</div>
                <div className="card-sub">Dernière mise à jour · {formatDate(settings.updatedAt)}</div>
              </div>
            </div>
            <div className="card-body">
              <ul className="settings-status-list">
                <li>
                  <span>Base MongoDB</span>
                  <span className={`badge ${databaseConnected ? "g" : "r"}`}>
                    {databaseConnected ? "Joignable" : "Hors ligne"}
                  </span>
                </li>
                <li>
                  <span>Administrateur</span>
                  <span>{profile?.email ?? "Session legacy"}</span>
                </li>
                <li>
                  <span>Dernière connexion</span>
                  <span>{formatDate(profile?.lastLoginAt)}</span>
                </li>
                <li>
                  <span>Email contact site</span>
                  <span>{settings.contactEmail}</span>
                </li>
                <li>
                  <span>Webhook recrutement</span>
                  <span className={`badge ${settings.infinitecoreWebhookEnabled ? "g" : "y"}`}>
                    {settings.infinitecoreWebhookEnabled ? "Activé" : "Désactivé"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {section === "account" ? (
        <div className="grid-2">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">👤 Organisation</div>
                <div className="card-sub">Coordonnées affichées sur le site public</div>
              </div>
            </div>
            <div className="card-body">
              <div className="blog-form-grid">
                <label className="blog-field">
                  <span>Nom commercial</span>
                  <input
                    value={settings.companyName}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, companyName: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>Raison sociale</span>
                  <input
                    value={settings.legalName}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, legalName: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>Email de contact</span>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, contactEmail: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>Téléphone principal</span>
                  <input
                    value={settings.phone}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, phone: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>Téléphone secondaire</span>
                  <input
                    value={settings.phoneSecondary ?? ""}
                    onChange={(e) =>
                      setSettings((prev) => prev && { ...prev, phoneSecondary: e.target.value || null })
                    }
                  />
                </label>
                <label className="blog-field">
                  <span>Site web</span>
                  <input
                    value={settings.website}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, website: e.target.value })}
                  />
                </label>
                <label className="blog-field">
                  <span>Ville</span>
                  <input
                    value={settings.city}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, city: e.target.value })}
                  />
                </label>
                <label className="blog-field blog-field-full">
                  <span>Adresse</span>
                  <input
                    value={settings.address}
                    onChange={(e) => setSettings((prev) => prev && { ...prev, address: e.target.value })}
                  />
                </label>
              </div>
              <div className="blog-more blog-form-actions settings-account-actions">
                <button
                  type="button"
                  className="btn-hero blog-form-primary"
                  disabled={saving}
                  onClick={() =>
                    void saveSettings(
                      {
                        companyName: settings.companyName,
                        legalName: settings.legalName,
                        contactEmail: settings.contactEmail,
                        phone: settings.phone,
                        phoneSecondary: settings.phoneSecondary,
                        website: settings.website,
                        city: settings.city,
                        address: settings.address,
                      },
                      "Informations organisation enregistrées et appliquées au site.",
                    )
                  }
                >
                  {saving ? "Enregistrement…" : "Enregistrer l'organisation"}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">🛡️ Profil administrateur</div>
                <div className="card-sub">
                  {profile
                    ? `Dernière mise à jour · ${formatDate(profile.updatedAt)}`
                    : "Session sans profil DB"}
                </div>
              </div>
            </div>
            <div className="card-body">
              {profile ? (
                <>
                  <div className="blog-form-grid">
                    <label className="blog-field">
                      <span>Nom affiché</span>
                      <input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </label>
                    <label className="blog-field">
                      <span>Email de connexion</span>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </label>
                    <div className="blog-field blog-field-full">
                      <span className="db-stub-desc">
                        Dernière connexion : {formatDate(profile.lastLoginAt)}
                      </span>
                    </div>
                  </div>
                  <div className="blog-more blog-form-actions settings-account-actions">
                    <button
                      type="button"
                      className="btn-hero blog-form-primary"
                      disabled={saving}
                      onClick={() => void saveProfile()}
                    >
                      {saving ? "Enregistrement…" : "Mettre à jour le profil"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="db-stub-desc">
                  Connectez-vous avec un compte administrateur en base (pas le mode legacy) pour
                  modifier le profil.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {section === "security" ? (
        <div className="grid-2">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">🔐 Préférences de sécurité</div>
                <div className="card-sub">Règles d&apos;accès au portail admin</div>
              </div>
            </div>
            <div className="card-body">
              <div className="blog-form-grid">
                <label className="blog-toggle blog-field-full" style={{ opacity: 0.7 }}>
                  <input type="checkbox" checked={false} disabled readOnly />
                  <span>
                    Double authentification (2FA) — bientôt disponible
                  </span>
                </label>
                <label className="blog-toggle">
                  <input
                    type="checkbox"
                    checked={settings.loginAlerts}
                    onChange={(e) =>
                      setSettings((prev) => prev && { ...prev, loginAlerts: e.target.checked })
                    }
                  />
                  <span>Journaliser les connexions réussies (logs serveur)</span>
                </label>
                <label className="blog-toggle blog-field-full">
                  <input
                    type="checkbox"
                    checked={settings.sessionTimeoutEnabled}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev && { ...prev, sessionTimeoutEnabled: e.target.checked },
                      )
                    }
                  />
                  <span>
                    Expiration courte des sessions (2 h). Désactivé = sessions jusqu&apos;à 7 jours.
                  </span>
                </label>
                <label className="blog-field blog-field-full">
                  <span>Rotation mot de passe admin (jours)</span>
                  <select
                    value={String(settings.passwordRotationDays)}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              passwordRotationDays: Number.parseInt(e.target.value, 10) as
                                | 30
                                | 60
                                | 90,
                            }
                          : prev,
                      )
                    }
                  >
                    <option value="30">Tous les 30 jours</option>
                    <option value="60">Tous les 60 jours</option>
                    <option value="90">Tous les 90 jours</option>
                  </select>
                </label>
                {passwordAgeDays !== null ? (
                  <div className="blog-field blog-field-full">
                    <span className={`badge ${rotationDue ? "y" : "g"}`}>
                      Âge du mot de passe : {passwordAgeDays} j
                      {rotationDue ? " — rotation recommandée" : ""}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="blog-more blog-form-actions settings-account-actions">
                <button
                  type="button"
                  className="btn-hero blog-form-primary"
                  disabled={saving}
                  onClick={() =>
                    void saveSettings(
                      {
                        twoFactorEnabled: false,
                        loginAlerts: settings.loginAlerts,
                        sessionTimeoutEnabled: settings.sessionTimeoutEnabled,
                        passwordRotationDays: settings.passwordRotationDays,
                      },
                      "Paramètres de sécurité enregistrés.",
                    )
                  }
                >
                  {saving ? "Enregistrement…" : "Enregistrer la sécurité"}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">🔑 Changer le mot de passe</div>
                <div className="card-sub">
                  12 caractères min. · majuscule · minuscule · chiffre · symbole
                </div>
              </div>
            </div>
            <div className="card-body">
              {profile ? (
                <div className="blog-form-grid">
                  <label className="blog-field blog-field-full">
                    <span>Mot de passe actuel</span>
                    <span className="password-input-wrap">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        autoComplete="current-password"
                      />
                      <PasswordVisibilityButton
                        visible={showPasswords}
                        onToggle={() => setShowPasswords((visible) => !visible)}
                      />
                    </span>
                  </label>
                  <label className="blog-field">
                    <span>Nouveau mot de passe</span>
                    <span className="password-input-wrap">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        autoComplete="new-password"
                      />
                      <PasswordVisibilityButton
                        visible={showPasswords}
                        onToggle={() => setShowPasswords((visible) => !visible)}
                      />
                    </span>
                  </label>
                  <label className="blog-field">
                    <span>Confirmer</span>
                    <span className="password-input-wrap">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        autoComplete="new-password"
                      />
                      <PasswordVisibilityButton
                        visible={showPasswords}
                        onToggle={() => setShowPasswords((visible) => !visible)}
                      />
                    </span>
                  </label>
                  {passwordForm.newPassword ? (
                    <div className="blog-field blog-field-full">
                      <span className={`badge ${passwordHints.length === 0 ? "g" : "y"}`}>
                        {passwordHints.length === 0
                          ? "Mot de passe conforme"
                          : `Manque : ${passwordHints.join(", ")}`}
                      </span>
                    </div>
                  ) : null}
                  <div className="blog-more blog-form-actions settings-account-actions blog-field-full">
                    <button
                      type="button"
                      className="btn-hero blog-form-primary"
                      disabled={saving || !passwordReady}
                      onClick={() => void changePassword()}
                    >
                      {saving ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="db-stub-desc">
                  Le changement de mot de passe nécessite un compte admin enregistré en base de
                  données.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {section === "integrations" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🔌 Intégrations & webhooks</div>
              <div className="card-sub">Services connectés au site {settings.companyName}</div>
            </div>
          </div>
          <div className="card-body">
            <div className="blog-form-grid">
              <label className="blog-toggle blog-field-full">
                <input
                  type="checkbox"
                  checked={settings.infinitecoreWebhookEnabled}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev && { ...prev, infinitecoreWebhookEnabled: e.target.checked },
                    )
                  }
                />
                <span>Activer le webhook Infinite Core (candidatures / partenariats)</span>
              </label>
              <label className="blog-field blog-field-full">
                <span>URL webhook Infinite Core (HTTPS)</span>
                <input
                  value={settings.infinitecoreWebhookUrl ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => prev && { ...prev, infinitecoreWebhookUrl: e.target.value })
                  }
                  placeholder="https://www.infinitecore.net/api/webhooks/noya-recrutement"
                />
              </label>
              <label className="blog-field blog-field-full">
                <span>URL publique recrutement</span>
                <input
                  value={settings.recruitmentPublicUrl ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => prev && { ...prev, recruitmentPublicUrl: e.target.value })
                  }
                  placeholder="/recrutement#travailler-avec-nous"
                />
              </label>
            </div>
            <div className="blog-more blog-form-actions settings-account-actions">
              <button
                type="button"
                className="btn-hero blog-form-primary"
                disabled={saving}
                onClick={() =>
                  void saveSettings(
                    {
                      infinitecoreWebhookEnabled: settings.infinitecoreWebhookEnabled,
                      infinitecoreWebhookUrl: settings.infinitecoreWebhookUrl,
                      recruitmentPublicUrl: settings.recruitmentPublicUrl,
                    },
                    "Intégrations enregistrées.",
                  )
                }
              >
                {saving ? "Enregistrement…" : "Enregistrer les intégrations"}
              </button>
              <button
                type="button"
                className="btn-hero blog-form-secondary"
                disabled={testingWebhook || !settings.infinitecoreWebhookEnabled}
                onClick={() => void testWebhook()}
              >
                {testingWebhook ? "Test…" : "Tester le webhook"}
              </button>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Portée</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bold">MongoDB Atlas</td>
                  <td>Données site & admin</td>
                  <td>
                    <span className={`badge ${databaseConnected ? "g" : "r"}`}>
                      {databaseConnected ? "Connecté" : "Erreur"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="bold">Infinite Core</td>
                  <td>Webhook recrutement</td>
                  <td>
                    <span className={`badge ${settings.infinitecoreWebhookEnabled ? "g" : "y"}`}>
                      {settings.infinitecoreWebhookEnabled ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="bold">Formulaire contact</td>
                  <td>{settings.contactEmail}</td>
                  <td>
                    <span className="badge g">Branché paramètres</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
