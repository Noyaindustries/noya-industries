import type { ReactNode } from "react";

type IntroAction = {
  href: string;
  label: string;
};

type IntroMetric = {
  label: string;
  value: string;
};

type IntroTheme = "gold" | "blue" | "violet" | "green" | "cobalt" | "silver";

type NoyaLandingPageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  primaryAction: IntroAction;
  secondaryAction?: IntroAction;
  kicker?: string;
  metrics: IntroMetric[];
  theme: IntroTheme;
};

export function NoyaLandingPageIntro({
  eyebrow,
  title,
  lead,
  primaryAction,
  secondaryAction,
  kicker,
  metrics,
  theme,
}: NoyaLandingPageIntroProps) {
  return (
    <section className={`sec-full page-intro page-intro-${theme}`}>
      <div className="inner">
        <div className="page-intro-shell rv in">
          <div className="page-intro-wrap">
            <p className="eyebrow rv in">{eyebrow}</p>
            <h1 className="display rv in d1">{title}</h1>
            <p className="lead rv in d2 page-intro-lead">
              {lead}
            </p>
            <div className="hero-actions rv in d3 page-intro-actions">
              <a href={primaryAction.href} className="btn-hero">
                {primaryAction.label}
              </a>
              {secondaryAction ? (
                <a href={secondaryAction.href} className="btn-outline">
                  {secondaryAction.label}
                </a>
              ) : null}
            </div>
            {kicker ? <p className="page-intro-kicker rv in d4">{kicker}</p> : null}
          </div>
          <aside className="page-intro-panel rs in d2" aria-label="Indicateurs clés">
            <div className="page-intro-panel-head">Points clés</div>
            <div className="page-intro-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="page-intro-metric">
                  <div className="page-intro-metric-value">{metric.value}</div>
                  <div className="page-intro-metric-label">{metric.label}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
        <div className="page-intro-divider rs in d3">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
