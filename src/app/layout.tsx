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
  metadataBase: new URL("https://www.noyaindustries.com"),
  icons: {
    icon: "/landing/noya-brand-mark.jpg",
    apple: "/landing/noya-brand-mark.jpg",
  },
  title: "Noya Industries — African Innovation & Consulting Group",
  description:
    "Cabinet de conseil et d’innovation : stratégie, transformation et écosystèmes pour les organisations en Afrique et à l’international.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Noya Industries — African Innovation & Consulting Group",
    description:
      "Clarifier aujourd’hui pour diriger demain. Conseil stratégique et innovation.",
    type: "website",
    url: "https://www.noyaindustries.com",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
