import { NoyaLandingBody } from "@/components/landing/NoyaLandingBody";
import { NoyaLandingClient } from "@/components/landing/NoyaLandingClient";

export const revalidate = 0;

export default function Home() {
  return (
    <>
      <div id="noya-landing-shell" suppressHydrationWarning>
        <NoyaLandingBody />
      </div>
      <NoyaLandingClient />
    </>
  );
}
