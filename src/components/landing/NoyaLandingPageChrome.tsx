import { NoyaLandingBackground } from "./sections/NoyaLandingBackground";
import { NoyaLandingFooter } from "./sections/NoyaLandingFooter";
import { NoyaLandingNav } from "./sections/NoyaLandingNav";
import { NoyaLandingClient } from "./NoyaLandingClient";

export function NoyaLandingPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NoyaLandingBackground />
      <NoyaLandingNav />
      {children}
      <NoyaLandingFooter />
      <NoyaLandingClient />
    </>
  );
}
