import Link from "next/link";

const links = [
  { href: "#mission", label: "Mission" },
  { href: "#services", label: "Expertises" },
  { href: "#impact", label: "Impact" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-[family-name:var(--font-fraunces)] text-lg tracking-tight text-noya-text"
        >
          <span className="font-semibold">Noya</span>
          <span className="text-noya-muted text-sm font-normal transition group-hover:text-noya-gold-soft">
            Industries
          </span>
        </Link>
        <nav className="hidden items-center gap-10 md:flex" aria-label="Principal">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.22em] text-noya-muted transition hover:text-noya-gold-soft"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="font-[family-name:var(--font-dm-mono)] rounded-full border border-noya-gold/40 bg-noya-gold/10 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-noya-gold-soft transition hover:border-noya-gold/70 hover:bg-noya-gold/15"
        >
          Prendre rendez-vous
        </a>
      </div>
    </header>
  );
}
