import { ContactForm } from "@/components/site/ContactForm";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-28 border-t border-noya-line px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-[family-name:var(--font-dm-mono)] mb-4 text-[11px] uppercase tracking-[0.28em] text-noya-gold-soft">
            Contact
          </p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium tracking-tight text-noya-text lg:text-4xl">
            Parlons de votre prochaine étape.
          </h2>
          <p className="mt-6 text-noya-muted leading-relaxed">
            Un premier échange confidentiel pour cadrer vos attentes. Réponse sous 48h ouvrées.
          </p>
          <div className="mt-10 space-y-4 font-[family-name:var(--font-dm-mono)] text-sm text-noya-muted">
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
                E-mail
              </span>
              <a
                href="mailto:contact@noyaindustries.com"
                className="text-noya-gold-soft transition hover:text-noya-text"
              >
                contact@noyaindustries.com
              </a>
            </p>
            <p>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-noya-faint">
                Bureaux
              </span>
              Paris · Nairobi · Abidjan
            </p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="card-premium rounded-3xl p-8 lg:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
