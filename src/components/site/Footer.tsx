import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-noya-line px-6 py-14 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/"
            className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-noya-text"
          >
            Noya Industries
          </Link>
          <p className="mt-3 max-w-sm text-sm text-noya-muted">
            African Innovation &amp; Consulting Group — conseil stratégique, innovation et
            transformation.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.2em] text-noya-faint">
          <a href="#mission" className="transition hover:text-noya-gold-soft">
            Mission
          </a>
          <a href="#services" className="transition hover:text-noya-gold-soft">
            Expertises
          </a>
          <a href="#contact" className="transition hover:text-noya-gold-soft">
            Contact
          </a>
        </div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-noya-faint">
          © {new Date().getFullYear()} Noya Industries. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
