"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type CmdItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  /** Mots-clés pour la recherche (minuscules) */
  kw: string;
};

const RECRUITMENT_URL =
  process.env.NEXT_PUBLIC_NOYA_RECRUTEMENT_URL ?? "/recrutement#travailler-avec-nous";

const COMMANDS: CmdItem[] = [
  {
    id: "sec-poles",
    title: "Pôles du groupe",
    subtitle: "Consulting, tech, academy, ventures",
    href: "/#poles",
    kw: "pôles consulting stratégie tech digital academy ventures innovation",
  },
  {
    id: "sec-story",
    title: "Notre histoire",
    subtitle: "Depuis 2021 · Abidjan",
    href: "/#story",
    kw: "histoire timeline groupe fondateur",
  },
  {
    id: "sec-products",
    title: "Produits & offres",
    subtitle: "PADDE, PRESENZ, Infinite Core…",
    href: "/#products",
    kw: "produits saas padde presenz infinite core logiciel",
  },
  {
    id: "sec-blog",
    title: "Actualités & insights",
    href: "/#blog",
    kw: "blog articles presse veille",
  },
  {
    id: "sec-team",
    title: "Équipe",
    href: "/#team",
    kw: "équipe talents dirigeants",
  },
  {
    id: "sec-partners",
    title: "Partenaires",
    href: "/#partners",
    kw: "partenaires alliances écosystème",
  },
  {
    id: "sec-contact",
    title: "Contact",
    subtitle: "Demande & réponse sous 24h",
    href: "/#contact",
    kw: "contact email message devis rendez-vous",
  },
  { id: "page-histoire", title: "Page · Histoire", href: "/histoire", kw: "histoire page marque" },
  { id: "page-poles", title: "Page · Pôles", href: "/poles", kw: "pôles page détail" },
  { id: "page-produits", title: "Page · Produits", href: "/produits", kw: "produits catalogue" },
  { id: "page-expertise", title: "Page · Expertise", href: "/expertise", kw: "expertise savoir-faire" },
  { id: "page-equipe", title: "Page · Équipe", href: "/equipe", kw: "équipe page" },
  { id: "page-contact", title: "Page · Contact", href: "/contact", kw: "contact page formulaire" },
  {
    id: "page-recrutement",
    title: "Recrutement & partenaires",
    href: RECRUITMENT_URL,
    kw: "recrutement carrière emploi partenaire cv",
  },
];

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function scoreItem(item: CmdItem, tokens: string[]): number {
  if (tokens.length === 0) return 1;
  const hay = `${item.title} ${item.subtitle ?? ""} ${item.kw}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 2;
    else if (item.title.toLowerCase().startsWith(t)) score += 1;
  }
  return score >= tokens.length * 2 ? score : 0;
}

export function NoyaCommandPalette() {
  const pathname = usePathname();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const tokens = tokenize(query);
    const scored = COMMANDS.map((c) => ({ c, s: scoreItem(c, tokens) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s || a.c.title.localeCompare(b.c.title, "fr"));
    return scored.map(({ c }) => c);
  }, [query]);

  const listActive = filtered.length ? Math.min(active, filtered.length - 1) : 0;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const closeRef = useRef(close);

  const go = useCallback(
    (href: string) => {
      close();
      if (href.startsWith("/#")) {
        const id = href.slice(2);
        if (pathname === "/") {
          window.requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          });
        } else {
          window.location.href = href;
        }
        return;
      }
      window.location.href = href;
    },
    [close, pathname],
  );

  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    const onPaletteOpen = () => {
      setOpen(true);
      setQuery("");
      setActive(0);
    };
    document.addEventListener("noya:command-palette", onPaletteOpen);
    return () => document.removeEventListener("noya:command-palette", onPaletteOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => {
          if (!filtered.length) return 0;
          const cur = Math.min(i, filtered.length - 1);
          return (cur + 1) % filtered.length;
        });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => {
          if (!filtered.length) return 0;
          const cur = Math.min(i, filtered.length - 1);
          return (cur - 1 + filtered.length) % filtered.length;
        });
        return;
      }
      if (e.key === "Enter") {
        const len = filtered.length;
        const idx = len ? Math.min(active, len - 1) : 0;
        const pick = filtered[idx];
        if (!pick) return;
        e.preventDefault();
        go(pick.href);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, filtered, active, go]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const target = e.target as HTMLElement | null;
        const inPalette = target?.closest?.(".noya-cmd-root");
        if (inPalette) {
          e.preventDefault();
          closeRef.current();
          return;
        }
        if (
          target &&
          (target.closest("input, textarea, select, [contenteditable=true]") ||
            target.getAttribute("role") === "textbox")
        ) {
          return;
        }
        e.preventDefault();
        setQuery("");
        setActive(0);
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, []);

  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-idx="${listActive}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [listActive]);

  if (!open) return null;

  return (
    <div className="noya-cmd-root" role="presentation">
      <button type="button" className="noya-cmd-backdrop" aria-label="Fermer" onClick={close} />
      <div
        className="noya-cmd-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="noya-cmd-head">
          <span id={titleId} className="noya-cmd-title">
            Navigation Noya
          </span>
          <kbd className="noya-cmd-kbd-hint" aria-hidden="true">
            Esc
          </kbd>
        </div>
        <div className="noya-cmd-search-wrap">
          <span className="noya-cmd-search-icon" aria-hidden="true">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="noya-cmd-input"
            aria-label="Rechercher une destination"
            placeholder="Rechercher une section, une page…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-controls="noya-cmd-list"
            title="Rechercher une destination"
          />
        </div>
        <div id="noya-cmd-list" ref={listRef} className="noya-cmd-list">
          {filtered.length === 0 ? (
            <p className="noya-cmd-empty">Aucun résultat. Essayez « contact », « pôles », « SaaS »…</p>
          ) : (
            filtered.map((item, idx) => {
              const isActive = idx === listActive;
              const rowClass = `noya-cmd-row${isActive ? " is-active" : ""}`;
              const inner = (
                <>
                  <span className="noya-cmd-row-title">{item.title}</span>
                  {item.subtitle ? (
                    <span className="noya-cmd-row-sub">{item.subtitle}</span>
                  ) : null}
                </>
              );
              return item.href.startsWith("/#") ? (
                <button
                  key={item.id}
                  type="button"
                  data-idx={idx}
                  aria-current={isActive ? "true" : undefined}
                  className={rowClass}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => go(item.href)}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  data-idx={idx}
                  aria-current={isActive ? "true" : undefined}
                  className={rowClass}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => close()}
                >
                  {inner}
                </Link>
              );
            })
          )}
        </div>
        <div className="noya-cmd-foot">
          <span>
            <kbd className="noya-cmd-kbd">↑</kbd>
            <kbd className="noya-cmd-kbd">↓</kbd> parcourir
          </span>
          <span>
            <kbd className="noya-cmd-kbd">↵</kbd> ouvrir
          </span>
        </div>
      </div>
    </div>
  );
}
