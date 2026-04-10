export function Mission() {
  return (
    <section id="mission" className="scroll-mt-28 px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="font-[family-name:var(--font-dm-mono)] mb-4 text-[11px] uppercase tracking-[0.28em] text-noya-gold-soft">
            Notre mission
          </p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-tight tracking-tight text-noya-text lg:text-4xl">
            Comprendre aujourd’hui pour{" "}
            <span className="italic text-noya-gold-soft">diriger demain</span>.
          </h2>
        </div>
        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-lg leading-[1.75] text-noya-muted">
            Noya est un catalyseur : nous ne prétendons pas connaître votre métier mieux que vous.
            Nous illuminons les chemins — en éliminant le superflu, en cadrant les priorités et en
            reliant vision, opérations et innovation dans un langage partagé par vos équipes et vos
            partenaires.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                t: "Pensée systémique",
                d: "Cartographie des interdépendances : marché, régulation, talents, tech.",
              },
              {
                t: "Exécution sobre",
                d: "Livrables actionnables, pas de slides creux. Nous restons jusqu’au premier pas.",
              },
              {
                t: "Ouverture continentale",
                d: "Hubs, diaspora et capitales : une lecture fine des écosystèmes africains.",
              },
              {
                t: "Confidentialité absolue",
                d: "Gouvernance des données et comités restreints pour les dossiers sensibles.",
              },
            ].map((item) => (
              <li key={item.t} className="card-premium rounded-2xl p-6">
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg text-noya-text">
                  {item.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-noya-muted">{item.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
