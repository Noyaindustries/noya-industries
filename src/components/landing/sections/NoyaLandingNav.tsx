"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { LANDING_IMG } from "../landingAssets";

const NAV_LINKS = [
  { href: "/histoire", label: "Histoire" },
  { href: "/poles", label: "Pôles" },
  { href: "/produits", label: "Produits" },
  { href: "/expertise", label: "Expertise" },
  { href: "/equipe", label: "Équipe" },
  { href: "/contact", label: "Contact" },
] as const;

export function NoyaLandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
      <nav className="nav" id="nav">
        <Link href="/" className="nav-logo" onClick={closeMenu}>
          <img src={LANDING_IMG.brandMark} alt="Noya Industries" />
        </Link>
        <div className="nav-mid">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <button
            type="button"
            className="nav-cmd-trigger"
            aria-label="Ouvrir la navigation rapide"
            title="Navigation rapide (Ctrl+K)"
            onClick={() => document.dispatchEvent(new CustomEvent("noya:command-palette"))}
          >
            <span className="nav-cmd-trigger-inner" aria-hidden="true">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 19h16M4 15h10M4 11h16M4 7h8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <kbd className="nav-cmd-kbd">K</kbd>
          </button>
          <button type="button" className="nav-lux-toggle" data-lux-toggle aria-label="Basculer le preset visuel luxe">
            Mode
            <span className="nav-lux-value" data-lux-label>Showroom</span>
          </button>
          <a href="/recrutement" className="nav-primary" onClick={closeMenu}>
            <span className="nav-primary-title">Devenir partenaire</span>
            <span className="nav-primary-arrow" aria-hidden="true">
              <svg width={14} height={14} fill="none" viewBox="0 0 14 14">
                <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
          <button
            type="button"
            className={`nav-menu-toggle${menuOpen ? " is-open" : ""}`}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls={panelId}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav-menu-bars" aria-hidden="true">
              <span className="nav-menu-bar" />
              <span className="nav-menu-bar" />
              <span className="nav-menu-bar" />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`nav-mobile-root${menuOpen ? " is-open" : ""}`}
        aria-hidden={menuOpen ? "false" : "true"}
      >
        <button type="button" className="nav-mobile-backdrop" tabIndex={-1} aria-label="Fermer le menu" onClick={closeMenu} />
        <div id={panelId} className="nav-mobile-panel" role="dialog" aria-modal="true" aria-label="Menu principal">
          <div className="nav-mobile-links">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
