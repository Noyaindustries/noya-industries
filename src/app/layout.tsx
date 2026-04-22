import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import "./noya-artifact.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noya Industries — African Innovation & Consulting Group",
  description:
    "Cabinet de conseil et d’innovation : stratégie, transformation et écosystèmes pour les organisations en Afrique et à l’international.",
  openGraph: {
    title: "Noya Industries — African Innovation & Consulting Group",
    description:
      "Clarifier aujourd’hui pour diriger demain. Conseil stratégique et innovation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${bricolage.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full" data-lux-preset="showroom">
        {children}
      </body>
    </html>
  );
}
